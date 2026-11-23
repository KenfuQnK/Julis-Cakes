import datetime as dt
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import server


class FoodGalleryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.photos = self.root / "fotos"
        self.photos.mkdir()
        self.json_path = self.root / "comidas.json"
        self.paths = patch.multiple(server, PHOTO_DIR=self.photos, DATA_FILE=self.json_path)
        self.paths.start()

    def tearDown(self):
        self.paths.stop()
        self.temp.cleanup()

    def photo(self, name, content=b"photo"):
        path = self.photos / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return path

    def test_scans_incrementally_and_ignores_video(self):
        self.photo("20240920_223334.jpg")
        self.photo("nested/20240920_223344.PNG")
        self.photo("20240920_223352.mp4")
        data, added = server.scan({"version": 1, "dishes": []})
        self.assertEqual(added, 2)
        self.assertEqual(len(data["dishes"]), 1)
        self.assertEqual(data["dishes"][0]["date"], "2024-09-20")
        self.assertEqual(data["dishes"][0]["photos"][1]["file"], "nested/20240920_223344.PNG")
        second, added_again = server.scan(data)
        self.assertEqual(added_again, 0)
        self.assertEqual(len(second["dishes"]), 1)

    def test_preserves_manual_groups_and_avoids_same_day_ambiguity(self):
        self.photo("20240920_223334.jpg")
        manual = {"id": "dish_manual", "date": "2024-09-20", "title": "Pizza", "cover": None, "manuallyOrganized": True, "photos": []}
        auto = {"id": "dish_auto", "date": "2024-09-20", "title": "Ensalada", "cover": None, "manuallyOrganized": False, "photos": []}
        result, added = server.scan({"version": 1, "dishes": [manual, auto]})
        self.assertEqual(added, 1)
        self.assertEqual(result["dishes"][0]["photos"], [])
        self.assertEqual(result["dishes"][1]["photos"], [])
        self.assertEqual(len(result["dishes"]), 3)

    def test_new_images_join_single_automatic_group_without_reordering_old(self):
        original = {"file": "20240920_223334.jpg", "date": "2024-09-20T22:33:34", "hidden": True}
        dish = {"id": "dish_auto", "date": "2024-09-20", "title": "20/09/2024 - Sin nombre", "cover": original["file"], "manuallyOrganized": False, "photos": [original]}
        self.photo("20240920_223344.jpg")
        result, added = server.scan({"version": 1, "dishes": [dish]})
        self.assertEqual(added, 1)
        self.assertEqual(result["dishes"][0]["photos"][0], original)
        self.assertEqual(len(result["dishes"]), 1)

    def test_save_is_atomic_and_validation_rejects_duplicate_files(self):
        data = {"version": 1, "dishes": [{"id": "one", "date": "2024-09-20", "title": "Pizza", "cover": None, "photos": []}]}
        server.save_data(data)
        self.assertEqual(server.load_data()["dishes"][0]["id"], "one")
        bad = {"version": 1, "dishes": [{"id": "one", "title": "A", "photos": [{"file": "same.jpg", "hidden": False}]}, {"id": "two", "title": "B", "photos": [{"file": "same.jpg", "hidden": False}]}]}
        with self.assertRaises(ValueError):
            server.validate(bad)

    def test_filename_date_takes_precedence_and_unknown_name_uses_file_date(self):
        path = self.photo("20240920_223334.jpg")
        self.assertEqual(server.photo_datetime(path), dt.datetime(2024, 9, 20, 22, 33, 34))
        other = self.photo("sin-fecha.jpg")
        stamp = dt.datetime(2020, 1, 2, 3, 4, 5).timestamp()
        import os
        os.utime(other, (stamp, stamp))
        self.assertEqual(server.photo_datetime(other), dt.datetime(2020, 1, 2, 3, 4, 5))

    def test_crop_is_preserved_and_out_of_bounds_crop_is_rejected(self):
        photo = {"file": "pizza.jpg", "hidden": False, "crop": {"x": 0.1, "y": 0.2, "width": 0.6, "height": 0.5}}
        data = {"version": 1, "dishes": [{"id": "pizza", "date": "2024-09-20", "title": "Pizza", "cover": "pizza.jpg", "photos": [photo]}]}
        server.save_data(data)
        self.assertEqual(server.load_data()["dishes"][0]["photos"][0]["crop"], photo["crop"])
        photo["crop"] = {"x": 0.6, "y": 0.2, "width": 0.6, "height": 0.5}
        with self.assertRaises(ValueError):
            server.validate(data)

    def test_crop_rounding_errors_are_clamped_but_real_overflow_is_rejected(self):
        crop = {"x": -0.00002, "y": -0.000001, "width": 1.00002, "height": 1.000001}
        data = {"version": 1, "dishes": [{"id": "pizza", "date": "2024-09-20", "title": "Pizza", "cover": "pizza.jpg", "photos": [{"file": "pizza.jpg", "hidden": False, "crop": crop}]}]}
        server.validate(data)
        self.assertEqual(crop, {"x": 0, "y": 0, "width": 1, "height": 1})
        crop["x"] = -0.001
        with self.assertRaises(ValueError):
            server.validate(data)


if __name__ == "__main__":
    unittest.main()
