import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Componente para la sección de chat con la IA (simulado)
export default function ChatSection() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  
  // Función para manejar el envío de mensajes
  const handleSend = () => {
    if (message.trim() === '') return;
    
    // Añadir mensaje del usuario al historial
    const newUserMessage = { id: Date.now(), text: message, sender: 'user' };
    setChatHistory(prevHistory => [...prevHistory, newUserMessage]);
    
    // Simular respuesta de la IA
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        text: `Gracias por tu mensaje sobre "${message}". ¿En qué más puedo ayudarte con tus recetas?`, 
        sender: 'ai' 
      };
      setChatHistory(prevHistory => [...prevHistory, aiResponse]);
    }, 1000);
    
    // Limpiar el input
    setMessage('');
  };

  // Renderizar mensajes en el chat
  const renderMessages = () => {
    return chatHistory.map(msg => (
      <View 
        key={msg.id} 
        style={[
          styles.messageContainer,
          msg.sender === 'user' ? styles.userMessage : styles.aiMessage
        ]}
      >
        <Text style={styles.messageText}>{msg.text}</Text>
      </View>
    ));
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat con la IA</Text>
      
      {/* Botón para subir foto */}
      <TouchableOpacity style={styles.uploadButton}>
        <Ionicons name="camera" size={18} color="white" />
        <Text style={styles.uploadButtonText}>Subir foto</Text>
      </TouchableOpacity>
      
      {/* Área de chat */}
      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {chatHistory.length === 0 ? (
          <Text style={styles.emptyChat}>Envía un mensaje para comenzar a chatear...</Text>
        ) : (
          renderMessages()
        )}
      </ScrollView>
      
      {/* Área de input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.chatBg,
    padding: Layout.padding.medium,
  },
  title: {
    fontSize: Layout.fontSize.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Layout.padding.medium,
    color: Colors.text,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonSecondary,
    borderRadius: Layout.borderRadius.small,
    padding: Layout.padding.medium,
    marginBottom: Layout.padding.medium,
  },
  uploadButtonText: {
    color: Colors.textLight,
    marginLeft: 8,
  },
  chatArea: {
    flex: 1,
    marginBottom: Layout.padding.medium,
  },
  chatContent: {
    paddingVertical: Layout.padding.small,
  },
  emptyChat: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: Layout.padding.medium,
    borderRadius: Layout.borderRadius.medium,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
  },
  messageText: {
    color: props => props.sender === 'user' ? Colors.textLight : Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.small,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    padding: Layout.padding.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    backgroundColor: Colors.buttonPrimary,
    padding: Layout.padding.medium,
    borderTopRightRadius: Layout.borderRadius.small,
    borderBottomRightRadius: Layout.borderRadius.small,
  },
});