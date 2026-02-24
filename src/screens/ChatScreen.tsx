import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getSocket } from '../socket/socket';
import {
  getMessagesService,
  markReadService,
  sendMessageService,
} from '../services/message.service';

const CONVERSATION_ID = 16;

export default function ChatScreen({ route }: any) {
  const conversationId =
    Number(route?.params?.conversationId) || CONVERSATION_ID;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const markReadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMarkTime = useRef(0);

  const scheduleMarkRead = () => {
    const now = Date.now();
    if (now - lastMarkTime.current < 1500) return;
    lastMarkTime.current = now;
    if (markReadTimer.current) {
      clearTimeout(markReadTimer.current);
    }
    markReadTimer.current = setTimeout(async () => {
      try {
        await markReadService(conversationId);
      } catch {
        // no-op: read receipts shouldn't block UI
      }
    }, 300);
  };

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await getMessagesService(conversationId);
      setMessages(data);
      scheduleMarkRead();
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const data = await sendMessageService({
        conversationId,
        text: text.trim(),
        clientId: Date.now().toString(),
      });
      setMessages(prev => [data, ...prev]);
      setText('');
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadMessages();

    const s = getSocket();
    if (!s) return;
    s.emit('join_conversation', conversationId);

    s.on('message:new', (m: any) => {
      setMessages(prev => [m, ...prev]);
      scheduleMarkRead();
    });

    return () => {
      s.off('message:new');
    };
  }, [conversationId]);

  useEffect(() => {
    return () => {
      if (markReadTimer.current) {
        clearTimeout(markReadTimer.current);
      }
    };
  }, []);

  const headerTitle = useMemo(() => 'BaatCheet', []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <Text style={styles.headerSubtitle}>Private lounge</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Live</Text>
        </View>
      </View>

      <View style={styles.listWrap}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color="#f3a63b" />
            <Text style={styles.loaderText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            inverted
            data={messages}
            keyExtractor={i => String(i.id)}
            contentContainerStyle={styles.listContent}
            onScrollBeginDrag={scheduleMarkRead}
            onScrollEndDrag={scheduleMarkRead}
            onMomentumScrollEnd={scheduleMarkRead}
            renderItem={({ item }) => (
              <View style={styles.bubble}>
                <Text style={styles.bubbleMeta}>
                  {item.sender?.name || `User ${item.senderId}`}
                </Text>
                <Text style={styles.bubbleText}>{item.text}</Text>
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message"
          placeholderTextColor="#7f7b8e"
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          onPress={send}
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          activeOpacity={0.85}
          disabled={sending}
        >
          <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0c0b10',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#201f29',
  },
  headerTitle: {
    color: '#f7f2ff',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'AvenirNext-Bold',
      android: 'sans-serif-condensed',
    }),
  },
  headerSubtitle: {
    color: '#b8b3c8',
    fontSize: 12,
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: '#f3a63b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  headerBadgeText: {
    color: '#1b1304',
    fontSize: 12,
    fontWeight: '700',
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: '#b8b3c8',
    marginTop: 10,
  },
  bubble: {
    backgroundColor: '#16151d',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#242231',
  },
  bubbleMeta: {
    color: '#f3a63b',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bubbleText: {
    color: '#f7f2ff',
    fontSize: 15,
    lineHeight: 20,
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: '#201f29',
    padding: 14,
    backgroundColor: '#0f0e14',
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#14131a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262334',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f5f2ff',
    fontSize: 15,
  },
  sendButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#f3a63b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendText: {
    color: '#1b1304',
    fontWeight: '700',
    fontSize: 14,
  },
});
