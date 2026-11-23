const gallery = document.querySelector("#gallery");
const notice = document.querySelector("#notice");
const statusEl = document.querySelector("#save-status");
const empty = document.querySelector("#empty");
const editor = document.querySelector("#editor");
const viewer = document.querySelector("#viewer");
const moveDialog = document.querySelector("#move-dialog");
const cropDialog = document.querySelector("#crop-dialog");
const cardActionMenu = document.querySelector("#card-action-menu");
const viewerActionMenu = document.querySelector("#viewer-action-menu");
let data = { version: 1, dishes: [] };
let missing = [];
let activeViewer = { dishId: null, index: 0 };
let saveTimer;
let saving = false;

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const photoUrl = (file) => "/photos/" + file.split("/").map(encodeURIComponent).join("/");
const formatDate = (date) => {
  if (!date) return "Fecha sin determinar";
  const [year, month, day] = date.split("-");
  return day + "/" + month + "/" + year;
};
const eyeIcon = (hidden) => '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>' + (hidden ? '<path d="M3 3 21 21" stroke-width="2.3"/>' : "") + "</svg>";
const starIcon = (selected) => '<svg viewBox="0 0 24 24" width="18" height="18" fill="' + (selected ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m12 2.5 2.95 6 6.62.96-4.79 4.67 1.13 6.6L12 17.61l-5.91 3.12 1.13-6.6-4.79-4.67 6.62-.96L12 2.5Z"/></svg>';
const saveIcon = (selected) => '<svg viewBox="0 0 24 24" width="19" height="19" fill="' + (selected ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M5 3.5h14v18l-7-4.6-7 4.6V3.5Z"/></svg>';
const cropStyle = (photo) => {
  if (!photo?.crop) return "";
  const { x, y, width, height } = photo.crop;
  return ' style="--crop-width:' + 100 / width + '%;--crop-height:' + 100 / height + '%;--crop-left:' + -100 * x / width + '%;--crop-top:' + -100 * y / height + '%"';
};
const toast = (message, error = false) => {
  notice.textContent = message;
  notice.classList.toggle("error", error);
  notice.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { notice.hidden = true; }, 4200);
};
const setStatus = (message, error = false) => {
  statusEl.textContent = message;
  statusEl.parentElement.classList.toggle("error", error);
};

async function loadGallery() {
  try {
    const response = await fetch("/api/data");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo leer la colección.");
    data = result.data;
    missing = result.missing || [];
    setStatus("Guardado en este equipo");
    render();
    if (result.added) toast(result.added + " foto" + (result.added === 1 ? "" : "s") + " nueva" + (result.added === 1 ? "" : "s") + " añadida" + (result.added === 1 ? "" : "s") + ".");
    if (result.scanError) { setStatus("Carpeta de fotos no disponible", true); toast(result.scanError, true); }
  } catch (error) {
    setStatus("Error de conexión", true);
    toast(error.message, true);
  }
}

async function persist(message = "Cambios guardados") {
  clearTimeout(saveTimer);
  if (saving) { saveTimer = setTimeout(() => persist(message), 250); return; }
  saving = true;
  setStatus("Guardando…");
  try {
    const payload = JSON.parse(JSON.stringify(data));
    payload.dishes.forEach((dish) => { delete dish._index; });
    const response = await fetch("/api/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo guardar.");
    setStatus(message);
  } catch (error) {
    setStatus("Error al guardar", true);
    toast(error.message, true);
  } finally {
    saving = false;
  }
}
function changed(message, ids = null) {
  if (ids) ids.forEach(updateCard);
  else render();
  persist(message);
}
function orderedDishes() {
  const term = document.querySelector("#search").value.trim().toLocaleLowerCase("es");
  const direction = document.querySelector("#sort").value === "oldest" ? 1 : -1;
  return data.dishes.filter((dish) => dish.title.toLocaleLowerCase("es").includes(term))
    .sort((a, b) => direction * String(a.date || "").localeCompare(String(b.date || "")) || a.title.localeCompare(b.title, "es"));
}
function render() {
  const dishes = orderedDishes();
  gallery.querySelector(".no-results")?.remove();
  const existing = new Map([...gallery.querySelectorAll(".card")].map((card) => [card.dataset.id, card]));
  dishes.forEach((dish, order) => {
    let card = existing.get(dish.id);
    if (card) existing.delete(dish.id);
    else {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = cardMarkup(dish, order);
      card = wrapper.firstElementChild;
    }
    gallery.append(card);
    const title = card.querySelector(".title-input");
    title.style.height = "auto";
    title.style.height = title.scrollHeight + "px";
    updateCard(dish.id);
  });
  existing.forEach((card) => card.remove());
  gallery.hidden = dishes.length === 0;
  empty.hidden = dishes.length !== 0 || data.dishes.length > 0 && Boolean(document.querySelector("#search").value);
  if (!dishes.length && data.dishes.length > 0) {
    gallery.hidden = false;
    gallery.innerHTML = '<p class="no-results">No hay platos con ese nombre.</p>';
  }
  const total = data.dishes.reduce((sum, dish) => sum + dish.photos.length, 0);
  document.querySelector("#collection-count").textContent = data.dishes.length + " plato" + (data.dishes.length === 1 ? "" : "s") + " · " + total + " foto" + (total === 1 ? "" : "s");
  document.querySelector("#footer-count").textContent = (missing.length ? missing.length + " archivo" + (missing.length === 1 ? "" : "s") + " sin encontrar · " : "") + data.dishes.length + " plato" + (data.dishes.length === 1 ? "" : "s");
}
function cardMarkup(dish, order) {
  const photos = dish.photos;
  if (dish._index === undefined) dish._index = Math.max(0, photos.findIndex((item) => item.file === dish.cover));
  const current = photos.length ? Math.min(dish._index || 0, photos.length - 1) : -1;
  const photo = current >= 0 ? photos[current] : null;
  const isMissing = photo && missing.includes(photo.file);
  const cover = dish.cover === photo?.file && !photo?.hidden;
  const image = photo && !isMissing
    ? '<img class="' + (photo.hidden ? "hidden-photo " : "") + (photo.crop ? "cropped-photo" : "") + '" src="' + photoUrl(photo.file) + '" alt="' + esc(dish.title) + (photo.hidden ? " · oculta" : "") + '" data-zoom="' + esc(photo.file) + '"' + cropStyle(photo) + '>'
    : '<div class="missing-photo">' + (photo ? "Archivo no encontrado" : "Aún sin fotografías") + "</div>";
  const coverControl = photo && !photo.hidden ? '<button class="icon-button ' + (cover ? "active" : "") + '" data-action="cover" data-id="' + esc(dish.id) + '" title="' + (cover ? "Portada seleccionada" : "Elegir como portada") + '" aria-label="' + (cover ? "Portada seleccionada" : "Elegir como portada") + '">' + starIcon(cover) + "</button>" : "";
  const hiddenControl = photo ? '<button class="icon-button ' + (photo.hidden ? "active" : "") + '" data-action="hide" data-id="' + esc(dish.id) + '" title="' + (photo.hidden ? "Mostrar fotografía" : "Ocultar fotografía") + '" aria-label="' + (photo.hidden ? "Mostrar fotografía" : "Ocultar fotografía") + '">' + eyeIcon(photo.hidden) + "</button>" : "";
  const menu = '<div class="card-menu"><button class="menu-toggle" data-action="menu" data-id="' + esc(dish.id) + '" aria-label="Acciones para ' + esc(dish.title) + '" aria-haspopup="menu">⋯</button></div>';
  return '<article class="card" data-id="' + esc(dish.id) + '" style="animation-delay:' + Math.min(order, 8) * 35 + 'ms"><div class="photo-stage" data-drop-id="' + esc(dish.id) + '" draggable="' + Boolean(photo) + '">' + image + '<span class="photo-count">' + (photos.length ? current + 1 : 0) + '/' + photos.length + ' fotos</span>' + (cover ? '<span class="cover-badge">Portada</span>' : "") + '<div class="photo-overlay"><button class="nav-arrow" data-action="prev" data-id="' + esc(dish.id) + '" aria-label="Fotografía anterior" ' + (photos.length < 2 ? "disabled" : "") + '>‹</button><button class="nav-arrow" data-action="next" data-id="' + esc(dish.id) + '" aria-label="Fotografía siguiente" ' + (photos.length < 2 ? "disabled" : "") + '>›</button></div><div class="photo-actions">' + coverControl + hiddenControl + "</div></div>" +
    '<div class="card-body"><div class="card-heading"><textarea class="title-input" rows="2" aria-label="Nombre del plato" maxlength="100" data-title="' + esc(dish.id) + '">' + esc(dish.title) + '</textarea><button class="save-button ' + (dish.favorite ? "saved" : "") + '" data-action="favorite" data-id="' + esc(dish.id) + '" aria-pressed="' + Boolean(dish.favorite) + '" title="' + (dish.favorite ? "Quitar de guardados" : "Guardar plato") + '" aria-label="' + (dish.favorite ? "Quitar de guardados" : "Guardar plato") + '">' + saveIcon(dish.favorite) + '</button>' + menu + '</div><div class="meta"><span>' + formatDate(dish.date) + '</span></div></div></article>';
}
function getDish(id) { return data.dishes.find((dish) => dish.id === id); }
function updateCard(id) {
  const dish = getDish(id);
  const card = [...gallery.querySelectorAll(".card")].find((item) => item.dataset.id === id);
  if (!dish || !card) return;
  dish._index = Math.max(0, Math.min(dish._index || 0, dish.photos.length - 1));
  const next = document.createElement("div");
  next.innerHTML = cardMarkup(dish, 0);
  const fresh = next.firstElementChild;
  const stage = card.querySelector(".photo-stage");
  const freshStage = fresh.querySelector(".photo-stage");
  const oldImage = stage.querySelector("img");
  const newImage = freshStage.querySelector("img");
  if (oldImage && newImage) {
    const nextSrc = newImage.getAttribute("src");
    if (oldImage.getAttribute("src") !== nextSrc) {
      const preload = new Image();
      preload.onload = () => {
        if (photoUrl(dish.photos[dish._index]?.file || "") === nextSrc) oldImage.src = nextSrc;
      };
      preload.src = nextSrc;
    }
    oldImage.className = newImage.className;
    oldImage.alt = newImage.alt;
    oldImage.dataset.zoom = newImage.dataset.zoom;
    oldImage.style.cssText = newImage.style.cssText;
  } else {
    stage.replaceChild(freshStage.firstElementChild, stage.firstElementChild);
  }
  stage.querySelector(".photo-count").textContent = freshStage.querySelector(".photo-count").textContent;
  stage.querySelectorAll(".nav-arrow").forEach((button, index) => { button.disabled = freshStage.querySelectorAll(".nav-arrow")[index].disabled; });
  stage.draggable = freshStage.draggable;
  stage.querySelector(".cover-badge")?.remove();
  const badge = freshStage.querySelector(".cover-badge");
  if (badge) stage.append(badge);
  stage.querySelector(".photo-actions").replaceWith(freshStage.querySelector(".photo-actions"));
  card.querySelector(".card-menu").replaceWith(fresh.querySelector(".card-menu"));
  card.querySelector(".save-button").replaceWith(fresh.querySelector(".save-button"));
  card.querySelector(".meta").textContent = formatDate(dish.date);
}
function movePhoto(sourceId, destinationId, photo) {
  const source = getDish(sourceId), destination = getDish(destinationId);
  if (!source || !destination || !photo || source === destination) return;
  console.info("[FoodGallery:move] inicio", { sourceId, destinationId, file: photo.file });
  source.photos = source.photos.filter((item) => item.file !== photo.file);
  if (source.cover === photo.file) source.cover = source.photos.find((item) => !item.hidden)?.file || source.photos[0]?.file || null;
  if (!destination.photos.some((item) => item.file === photo.file)) destination.photos.push(photo);
  if (!destination.cover && !photo.hidden) destination.cover = photo.file;
  source.manuallyOrganized = destination.manuallyOrganized = true;
  if (!source.photos.length) {
    data.dishes = data.dishes.filter((item) => item.id !== source.id);
    console.info("[FoodGallery:move] origen eliminado", { sourceId });
    changed("Fotografía movida; plato vacío eliminado");
  } else changed("Fotografía movida", [source.id, destination.id]);
  console.info("[FoodGallery:move] guardado solicitado", { sourceId, destinationId });
  if (viewer.open && activeViewer.dishId === source.id) updateViewer();
}
function openViewer(dish, index) {
  if (!dish?.photos.length) return;
  activeViewer = { dishId: dish.id, index: (index + dish.photos.length) % dish.photos.length };
  updateViewer();
  viewer.showModal();
}
function updateViewer() {
  const dish = getDish(activeViewer.dishId);
  if (!dish?.photos.length) { viewer.close(); return; }
  activeViewer.index = (activeViewer.index + dish.photos.length) % dish.photos.length;
  const photo = dish.photos[activeViewer.index];
  document.querySelector("#viewer-image").src = photoUrl(photo.file);
  document.querySelector("#viewer-image").alt = dish.title;
  document.querySelector("#viewer-image").classList.toggle("hidden-photo", photo.hidden);
  document.querySelector("#viewer-caption").textContent = dish.title + " · " + (activeViewer.index + 1) + " / " + dish.photos.length + (photo.hidden ? " · oculta" : "");
  viewerActionMenu.hidden = true;
}

function menuMarkup(dish, photo, inViewer = false) {
  const id = esc(dish.id);
  const action = (name, label) => '<button type="button" data-action="' + name + '" data-id="' + id + '" role="menuitem">' + label + "</button>";
  return (photo ? action("crop", "Editar foto") + (photo.hidden ? "" : action("cover", "Elegir como portada")) + action("hide", photo.hidden ? "Mostrar fotografía" : "Ocultar fotografía") + action("move", "Mover a…") + action("left", "Mover antes") + action("right", "Mover después") : "") +
    (!inViewer && !dish.photos.length ? action("delete", "Eliminar plato vacío") : "");
}
function openCardMenu(button, dish, photo) {
  const wasOpen = !cardActionMenu.hidden && cardActionMenu.dataset.id === dish.id;
  cardActionMenu.hidden = wasOpen;
  if (wasOpen) return;
  cardActionMenu.dataset.id = dish.id;
  cardActionMenu.innerHTML = menuMarkup(dish, photo);
  cardActionMenu.hidden = false;
  cardActionMenu.classList.add("open");
  const rect = button.getBoundingClientRect();
  const width = 190;
  const height = cardActionMenu.getBoundingClientRect().height;
  cardActionMenu.style.left = Math.max(8, Math.min(rect.right - width, innerWidth - width - 8)) + "px";
  cardActionMenu.style.top = (rect.bottom + height + 8 <= innerHeight ? rect.bottom + 4 : Math.max(8, rect.top - height - 4)) + "px";
}
function runAction(action, dish, index) {
  if (!dish) return;
  const photo = dish.photos[index];
  switch (action) {
    case "prev": dish._index = (index - 1 + dish.photos.length) % dish.photos.length; updateCard(dish.id); break;
    case "next": dish._index = (index + 1) % dish.photos.length; updateCard(dish.id); break;
    case "favorite": dish.favorite = !dish.favorite; changed(dish.favorite ? "Plato guardado" : "Plato quitado de guardados", [dish.id]); break;
    case "cover":
      if (!photo || photo.hidden) { toast("Muestra la fotografía antes de elegirla como portada.", true); break; }
      dish.photos.splice(index, 1);
      dish.photos.unshift(photo);
      dish.cover = photo.file;
      dish._index = 0;
      activeViewer.index = 0;
      dish.manuallyOrganized = true;
      changed("Portada actualizada", [dish.id]);
      break;
    case "hide":
      if (!photo) break;
      photo.hidden = !photo.hidden;
      if (photo.hidden && dish.cover === photo.file) {
        const replacement = dish.photos.find((item) => !item.hidden);
        dish.cover = replacement?.file || null;
        if (replacement) {
          dish.photos.splice(dish.photos.indexOf(replacement), 1);
          dish.photos.unshift(replacement);
          dish._index = dish.photos.indexOf(photo);
          activeViewer.index = dish._index;
        }
      }
      dish.manuallyOrganized = true;
      changed(photo.hidden ? "Fotografía oculta" : "Fotografía visible", [dish.id]);
      break;
    case "move": openMoveDialog(dish, photo); break;
    case "crop": openCropDialog(dish, photo); break;
    case "left":
    case "right": {
      if (!photo || dish.photos.length < 2) break;
      const targetIndex = Math.max(0, Math.min(dish.photos.length - 1, index + (action === "left" ? -1 : 1)));
      if (targetIndex === index) break;
      dish.photos.splice(index, 1);
      dish.photos.splice(targetIndex, 0, photo);
      dish._index = targetIndex;
      activeViewer.index = targetIndex;
      dish.manuallyOrganized = true;
      changed("Orden de fotografías actualizado", [dish.id]);
      break;
    }
    case "delete":
      if (dish.photos.length) { toast("Solo se pueden eliminar platos vacíos. Mueve antes sus fotografías.", true); break; }
      if (confirm("¿Eliminar el plato vacío «" + dish.title + "»?")) { data.dishes = data.dishes.filter((item) => item.id !== dish.id); changed("Plato eliminado"); }
      break;
  }
  if (viewer.open && activeViewer.dishId === dish.id && action !== "move" && action !== "crop") updateViewer();
}
gallery.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    const image = event.target.closest("[data-zoom]");
    if (image) {
      const dish = getDish(image.closest(".card").dataset.id);
      openViewer(dish, dish._index || 0);
    }
    return;
  }
  const dish = getDish(button.dataset.id);
  if (!dish) return;
  const index = Math.max(0, Number(dish._index || 0));
  const photo = dish.photos[index];
  if (button.dataset.action === "menu") openCardMenu(button, dish, photo);
  else runAction(button.dataset.action, dish, index);
});
cardActionMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  cardActionMenu.hidden = true;
  const dish = getDish(button.dataset.id);
  runAction(button.dataset.action, dish, dish?._index || 0);
});
document.querySelector("#viewer-menu-toggle").addEventListener("click", () => {
  const dish = getDish(activeViewer.dishId);
  if (!dish) return;
  viewerActionMenu.innerHTML = menuMarkup(dish, dish.photos[activeViewer.index], true);
  viewerActionMenu.hidden = !viewerActionMenu.hidden;
});
viewerActionMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  viewerActionMenu.hidden = true;
  const dish = getDish(activeViewer.dishId);
  if (dish) { dish._index = activeViewer.index; runAction(button.dataset.action, dish, activeViewer.index); }
});
function openMoveDialog(dish, photo) {
  if (!photo) return;
  moveDialog.dataset.sourceId = dish.id;
  moveDialog.dataset.file = photo.file;
  document.querySelector("#move-photo-name").textContent = photo.file.split("/").at(-1);
  const targets = data.dishes.filter((item) => item.id !== dish.id);
  document.querySelector("#move-options").innerHTML = targets.length
    ? targets.map((item) => {
      const preview = item.photos.find((entry) => entry.file === item.cover && !entry.hidden) || item.photos.find((entry) => !entry.hidden) || item.photos[0];
      const thumbnail = preview && !missing.includes(preview.file) ? '<img class="move-thumbnail" src="' + photoUrl(preview.file) + '" alt="">' : '<span class="move-thumbnail empty-thumbnail" aria-hidden="true">—</span>';
      return '<button type="button" data-target="' + esc(item.id) + '">' + thumbnail + '<span class="move-option-details"><strong>' + esc(item.title) + '</strong><small>' + formatDate(item.date) + '</small></span></button>';
    }).join("")
    : '<p>Crea otro plato para poder mover esta foto.</p>';
  moveDialog.showModal();
}
document.querySelector("#move-options").addEventListener("click", (event) => {
  const target = event.target.closest("[data-target]");
  if (!target) return;
  const source = getDish(moveDialog.dataset.sourceId);
  const photo = source?.photos.find((item) => item.file === moveDialog.dataset.file);
  moveDialog.close();
  movePhoto(source?.id, target.dataset.target, photo);
});
document.querySelector("#move-close").addEventListener("click", () => moveDialog.close());
const cropCanvas = document.querySelector("#crop-canvas");
const cropImage = document.querySelector("#crop-image");
const cropSelection = document.querySelector("#crop-selection");
let cropRect = null;
let cropPointer = null;
let cropAspect = 1.45;
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
function paintCrop() {
  if (!cropRect) return;
  cropSelection.style.left = cropRect.x + "px";
  cropSelection.style.top = cropRect.y + "px";
  cropSelection.style.width = cropRect.width + "px";
  cropSelection.style.height = cropRect.height + "px";
}
function initialCrop(photo) {
  const width = cropCanvas.clientWidth, height = cropCanvas.clientHeight;
  if (photo.crop) {
    cropRect = { x: photo.crop.x * width, y: photo.crop.y * height, width: photo.crop.width * width, height: photo.crop.height * height };
  } else {
    const selectionWidth = Math.min(width, height * cropAspect);
    const selectionHeight = selectionWidth / cropAspect;
    cropRect = { x: (width - selectionWidth) / 2, y: (height - selectionHeight) / 2, width: selectionWidth, height: selectionHeight };
  }
  paintCrop();
}
function openCropDialog(dish, photo) {
  if (!photo || missing.includes(photo.file)) { toast("No se puede editar una foto que no está disponible.", true); return; }
  cropDialog.dataset.dishId = dish.id;
  cropDialog.dataset.file = photo.file;
  const stage = [...gallery.querySelectorAll(".card")].find((card) => card.dataset.id === dish.id)?.querySelector(".photo-stage");
  cropAspect = stage ? stage.clientWidth / stage.clientHeight : 1.45;
  cropImage.onload = () => {
    const scale = Math.min(800 / cropImage.naturalWidth, Math.min(innerWidth - 76, 800) / cropImage.naturalWidth, Math.min(innerHeight * 0.58, 540) / cropImage.naturalHeight, 1);
    cropCanvas.style.width = Math.max(1, Math.round(cropImage.naturalWidth * scale)) + "px";
    cropCanvas.style.height = Math.max(1, Math.round(cropImage.naturalHeight * scale)) + "px";
    cropDialog.showModal();
    initialCrop(photo);
  };
  cropImage.onerror = () => toast("No se pudo abrir esta foto.", true);
  cropImage.src = photoUrl(photo.file);
}
cropCanvas.addEventListener("pointerdown", (event) => {
  if (!cropRect) return;
  event.preventDefault();
  const bounds = cropCanvas.getBoundingClientRect();
  const point = { x: clamp(event.clientX - bounds.left, 0, bounds.width), y: clamp(event.clientY - bounds.top, 0, bounds.height) };
  const handle = event.target.closest(".crop-handle");
  const inside = event.target.closest(".crop-selection");
  cropPointer = { id: event.pointerId, mode: handle ? "resize" : inside ? "move" : "draw", origin: point, initial: { ...cropRect } };
  cropCanvas.setPointerCapture(event.pointerId);
});
cropCanvas.addEventListener("pointermove", (event) => {
  if (!cropPointer || event.pointerId !== cropPointer.id) return;
  const bounds = cropCanvas.getBoundingClientRect();
  const x = clamp(event.clientX - bounds.left, 0, bounds.width), y = clamp(event.clientY - bounds.top, 0, bounds.height);
  const start = cropPointer.initial;
  if (cropPointer.mode === "move") {
    cropRect.x = clamp(start.x + x - cropPointer.origin.x, 0, bounds.width - start.width);
    cropRect.y = clamp(start.y + y - cropPointer.origin.y, 0, bounds.height - start.height);
  } else if (cropPointer.mode === "resize") {
    const maximum = Math.min(bounds.width - start.x, (bounds.height - start.y) * cropAspect);
    cropRect.width = clamp(Math.max(x - start.x, (y - start.y) * cropAspect), Math.min(36, maximum), maximum);
    cropRect.height = cropRect.width / cropAspect;
  } else {
    const signX = x >= cropPointer.origin.x ? 1 : -1, signY = y >= cropPointer.origin.y ? 1 : -1;
    const maxWidth = Math.min(signX > 0 ? bounds.width - cropPointer.origin.x : cropPointer.origin.x, (signY > 0 ? bounds.height - cropPointer.origin.y : cropPointer.origin.y) * cropAspect);
    const width = clamp(Math.max(Math.abs(x - cropPointer.origin.x), Math.abs(y - cropPointer.origin.y) * cropAspect), Math.min(12, maxWidth), maxWidth);
    cropRect = { x: signX > 0 ? cropPointer.origin.x : cropPointer.origin.x - width, y: signY > 0 ? cropPointer.origin.y : cropPointer.origin.y - width / cropAspect, width, height: width / cropAspect };
  }
  paintCrop();
});
cropCanvas.addEventListener("pointerup", () => { cropPointer = null; });
cropCanvas.addEventListener("pointercancel", () => { cropPointer = null; });
document.querySelector("#crop-close").addEventListener("click", () => cropDialog.close());
document.querySelector("#crop-reset").addEventListener("click", () => {
  const dish = getDish(cropDialog.dataset.dishId);
  const photo = dish?.photos.find((item) => item.file === cropDialog.dataset.file);
  if (!photo) return;
  delete photo.crop;
  cropDialog.close();
  changed("Encuadre restablecido", [dish.id]);
});
document.querySelector("#crop-save").addEventListener("click", () => {
  const dish = getDish(cropDialog.dataset.dishId);
  const photo = dish?.photos.find((item) => item.file === cropDialog.dataset.file);
  if (!photo || !cropRect) return;
  const width = cropCanvas.clientWidth, height = cropCanvas.clientHeight;
  const x = clamp(cropRect.x / width, 0, 1);
  const y = clamp(cropRect.y / height, 0, 1);
  photo.crop = {
    x,
    y,
    width: clamp(cropRect.width / width, Number.EPSILON, 1 - x),
    height: clamp(cropRect.height / height, Number.EPSILON, 1 - y),
  };
  cropDialog.close();
  changed("Encuadre guardado", [dish.id]);
});
gallery.addEventListener("input", (event) => {
  const input = event.target.closest("[data-title]");
  if (!input) return;
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
  const dish = getDish(input.dataset.title);
  dish.title = input.value;
  clearTimeout(saveTimer);
  setStatus("Cambios pendientes…");
  saveTimer = setTimeout(() => persist(), 500);
});
gallery.addEventListener("focusout", (event) => { if (event.target.matches("[data-title]")) event.target.value = getDish(event.target.dataset.title)?.title || ""; });
gallery.addEventListener("dragstart", (event) => {
  const stage = event.target.closest(".photo-stage");
  if (!stage) return;
  const dish = getDish(stage.dataset.dropId), photo = dish?.photos[dish._index || 0];
  if (photo) { event.dataTransfer.setData("application/food-gallery-photo", JSON.stringify({ from: dish.id, file: photo.file })); event.dataTransfer.effectAllowed = "move"; }
});
gallery.addEventListener("dragover", (event) => { if (event.target.closest(".photo-stage")) event.preventDefault(); });
gallery.addEventListener("drop", (event) => {
  const stage = event.target.closest(".photo-stage");
  if (!stage) return;
  event.preventDefault();
  try {
    const transfer = JSON.parse(event.dataTransfer.getData("application/food-gallery-photo"));
    const source = getDish(transfer.from);
    movePhoto(transfer.from, stage.dataset.dropId, source?.photos.find((photo) => photo.file === transfer.file));
  } catch { toast("No se pudo mover la fotografía.", true); }
});
document.querySelector("#search").addEventListener("input", render);
document.querySelector("#sort").addEventListener("change", render);
document.querySelector("#rescan").addEventListener("click", async () => {
  const button = document.querySelector("#rescan");
  button.disabled = true;
  try {
    const response = await fetch("/api/scan", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo escanear.");
    data = result.data;
    await loadGallery();
    toast(result.added ? result.added + " fotografía" + (result.added === 1 ? "" : "s") + " nueva añadida." : "La colección está al día.");
  } catch (error) { toast(error.message, true); setStatus("Error al escanear", true); }
  finally { button.disabled = false; }
});
document.querySelector("#empty-scan").addEventListener("click", () => document.querySelector("#rescan").click());
function createDish(title, date) {
  data.dishes.unshift({ id: "dish_" + crypto.randomUUID(), title, date, cover: null, manuallyOrganized: true, favorite: false, photos: [] });
  changed("Plato creado");
}
function openEditor(dish = null) {
  document.querySelector("#editor-heading").textContent = dish ? "Editar plato" : "Nuevo plato";
  document.querySelector("#editor-submit").textContent = dish ? "Guardar cambios" : "Crear plato";
  document.querySelector("#dish-name").value = dish?.title || "";
  document.querySelector("#dish-date").value = dish?.date || new Date().toISOString().slice(0, 10);
  editor.dataset.editId = dish?.id || "";
  editor.showModal();
  document.querySelector("#dish-name").focus();
}
document.querySelector("#new-dish").addEventListener("click", () => openEditor());
document.querySelector("#editor-form").addEventListener("submit", (event) => {
  if (event.submitter?.value !== "save") return;
  event.preventDefault();
  const title = document.querySelector("#dish-name").value.trim();
  const date = document.querySelector("#dish-date").value;
  if (!title || !date) return;
  const dish = getDish(editor.dataset.editId);
  if (dish) { dish.title = title; dish.date = date; dish.manuallyOrganized = true; changed("Plato actualizado"); }
  else createDish(title, date);
  editor.close();
});
document.querySelector(".viewer-close").addEventListener("click", () => viewer.close());
document.querySelector(".viewer-arrow.prev").addEventListener("click", () => { activeViewer.index--; updateViewer(); });
document.querySelector(".viewer-arrow.next").addEventListener("click", () => { activeViewer.index++; updateViewer(); });
document.addEventListener("click", (event) => {
  if (!event.target.closest("#card-action-menu, .card-menu")) cardActionMenu.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); document.querySelector("#search").focus(); }
  if (viewer.open && event.key === "ArrowLeft") { activeViewer.index--; updateViewer(); }
  if (viewer.open && event.key === "ArrowRight") { activeViewer.index++; updateViewer(); }
});
loadGallery();
