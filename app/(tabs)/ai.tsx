import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/Colors";
import {
  askAssistant,
  type AssistantChatMessage,
} from "@/src/services/assistant.service";

type AssistantProvider = "openai" | "local" | null;

export default function AiScreen() {
  const { t } = useTranslation(["recipes"]);
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [provider, setProvider] = useState<AssistantProvider>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (value: string) => {
      const nextMessage = value.trim();
      if (!nextMessage || isSending) return;

      const previousMessages = messages;
      const userMessage: AssistantChatMessage = {
        role: "user",
        content: nextMessage,
      };
      setMessage("");
      setMessages((current) => [...current, userMessage]);
      setError(null);
      setIsSending(true);

      try {
        const response = await askAssistant(nextMessage, previousMessages);
        setMessages((current) => [
          ...current,
          { role: "assistant", content: response.answer },
        ]);
        setProvider(response.provider);
      } catch {
        setMessages(previousMessages);
        setError(t("recipes:ai.requestFailed"));
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages, t],
  );

  const suggestions = [
    t("recipes:ai.suggestions.substitution"),
    t("recipes:ai.suggestions.time"),
    t("recipes:ai.suggestions.texture"),
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <View style={{ paddingTop: insets.top + 18 }} className="px-5 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[30px] font-extrabold text-foreground">
              {t("recipes:ai.title")}
            </Text>
            <Text className="mt-1 text-[15px] text-muted">
              {t("recipes:ai.subtitle")}
            </Text>
          </View>
          <View className="flex-row items-center rounded-full bg-success/10 px-3 py-2">
            <View className="mr-2 h-2 w-2 rounded-full bg-success" />
            <Text className="text-xs font-bold text-success">
              {t(
                provider === "openai"
                  ? "recipes:ai.statusOnline"
                  : "recipes:ai.statusReady",
              )}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="flex-1 px-5"
      >
        {messages.length === 0 ? (
          <View className="mt-4 rounded-[28px] bg-surface p-6">
            <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
              <FontAwesome name="magic" size={25} color={Colors.primary} />
            </View>
            <Text className="mb-2 text-xl font-bold text-foreground">
              {t("recipes:ai.welcomeTitle")}
            </Text>
            <Text className="text-base leading-6 text-muted">
              {t("recipes:ai.welcomeBody")}
            </Text>
          </View>
        ) : null}

        <View className="mt-5 gap-3">
          {messages.map((item, index) => (
            <View
              key={`${item.role}-${index}`}
              className={`max-w-[88%] rounded-[22px] px-4 py-3 ${
                item.role === "user"
                  ? "self-end bg-primary"
                  : "self-start bg-surface"
              }`}
            >
              <Text
                className={`text-base leading-6 ${
                  item.role === "user" ? "text-white" : "text-foreground"
                }`}
              >
                {item.content}
              </Text>
            </View>
          ))}
          {isSending ? (
            <View className="self-start rounded-[22px] bg-surface px-4 py-3">
              <Text className="text-sm font-semibold text-muted">
                {t("recipes:ai.sending")}
              </Text>
            </View>
          ) : null}
        </View>

        {error ? (
          <Text className="mt-3 text-sm font-semibold text-error">{error}</Text>
        ) : null}

        <View className="mt-6 gap-2">
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => void sendMessage(suggestion)}
              disabled={isSending}
              accessibilityRole="button"
              accessibilityLabel={suggestion}
              className="min-h-[44px] self-start rounded-full border border-primary/35 bg-surface px-4 py-2 active:opacity-70 disabled:opacity-50"
            >
              <Text className="text-sm font-semibold text-primary">
                {suggestion}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className="border-t border-border bg-surface px-5 pb-5 pt-3">
        <View className="flex-row items-end rounded-[22px] border border-border bg-background p-2">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t("recipes:ai.placeholder")}
            placeholderTextColor={Colors.muted}
            multiline
            maxLength={2000}
            accessibilityLabel={t("recipes:ai.placeholder")}
            className="min-h-[48px] max-h-28 flex-1 px-3 py-2 text-base leading-6 text-foreground"
          />
          <Pressable
            onPress={() => void sendMessage(message)}
            disabled={!message.trim() || isSending}
            accessibilityRole="button"
            accessibilityLabel={t("recipes:ai.send")}
            className="h-12 w-12 items-center justify-center rounded-2xl bg-primary active:opacity-80 disabled:opacity-40"
          >
            <FontAwesome name="send" size={17} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
