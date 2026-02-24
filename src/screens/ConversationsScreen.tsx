import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createPrivateConversationService,
  getConversationsService,
} from '../services/conversation.service';

type Conversation = {
  id: number;
  lastMessage?: { text?: string | null };
};

export default function ConversationsScreen({ navigation }: any) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState('');

  async function loadConversations() {
    setLoading(true);
    try {
      const data = await getConversationsService();
      setConversations(data as Conversation[]);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }

  async function createPrivateChat() {
    if (!otherUserId.trim()) {
      setError('Enter a user id to start a private chat.');
      return;
    }

    const id = Number(otherUserId);
    if (!id || Number.isNaN(id)) {
      setError('User id must be a number.');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const convo = await createPrivateConversationService(id);
      navigation.navigate('Chat', { conversationId: convo.id });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not create conversation.');
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  const headerTitle = useMemo(() => 'Conversations', []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bgAccentTop} />
      <View style={styles.bgAccentBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{headerTitle}</Text>
          <Text style={styles.subtitle}>Your private rooms</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Start a private chat</Text>
          <Text style={styles.sectionHint}>
            Enter the other user id to create a 1:1 room.
          </Text>
          <View style={styles.row}>
            <TextInput
              value={otherUserId}
              onChangeText={setOtherUserId}
              placeholder="User id"
              placeholderTextColor="#7f7b8e"
              keyboardType="number-pad"
              style={styles.input}
            />
            <TouchableOpacity
              onPress={createPrivateChat}
              activeOpacity={0.85}
              style={[styles.cta, creating && styles.ctaDisabled]}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#15110a" />
              ) : (
                <Text style={styles.ctaText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recent</Text>
          <TouchableOpacity onPress={loadConversations}>
            <Text style={styles.refresh}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color="#f3a63b" />
            <Text style={styles.loaderText}>Loading conversations...</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Chat', { conversationId: item.id })
                }
                style={styles.convoCard}
                activeOpacity={0.85}
              >
                <View style={styles.convoAvatar}>
                  <Text style={styles.convoAvatarText}>BC</Text>
                </View>
                <View style={styles.convoBody}>
                  <Text style={styles.convoTitle}>Conversation #{item.id}</Text>
                  <Text style={styles.convoSubtitle} numberOfLines={1}>
                    {item.lastMessage?.text || 'Start talking to light it up.'}
                  </Text>
                </View>
                <Text style={styles.convoArrow}>›</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptySubtitle}>
                  Create a private chat to get started.
                </Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0c0b10',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },
  bgAccentTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#2a2cf4',
    opacity: 0.15,
    top: -110,
    right: -40,
  },
  bgAccentBottom: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#f86b3a',
    opacity: 0.12,
    bottom: -140,
    left: -90,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    color: '#f7f2ff',
    fontSize: 26,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'AvenirNext-Bold',
      android: 'sans-serif-condensed',
    }),
  },
  subtitle: {
    color: '#b8b3c8',
    marginTop: 4,
    fontSize: 13,
  },
  card: {
    backgroundColor: '#14131a',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#23212c',
  },
  sectionTitle: {
    color: '#f3a63b',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  sectionHint: {
    color: '#b8b3c8',
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#0f0e14',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262334',
    paddingHorizontal: 14,
    color: '#f5f2ff',
    fontSize: 14,
  },
  cta: {
    marginLeft: 10,
    backgroundColor: '#f3a63b',
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: '#1b1304',
    fontWeight: '700',
    fontSize: 14,
  },
  error: {
    color: '#ff8067',
    marginTop: 10,
  },
  listHeader: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    color: '#f7f2ff',
    fontSize: 16,
    fontWeight: '600',
  },
  refresh: {
    color: '#f3a63b',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 30,
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
  convoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#15141c',
    borderWidth: 1,
    borderColor: '#242231',
    marginBottom: 12,
  },
  convoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2c2a38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  convoAvatarText: {
    color: '#f3a63b',
    fontWeight: '700',
  },
  convoBody: {
    flex: 1,
    marginLeft: 12,
  },
  convoTitle: {
    color: '#f7f2ff',
    fontSize: 15,
    fontWeight: '600',
  },
  convoSubtitle: {
    color: '#9f9aaf',
    marginTop: 4,
    fontSize: 12,
  },
  convoArrow: {
    color: '#6b657a',
    fontSize: 22,
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#f7f2ff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#b8b3c8',
    marginTop: 6,
    fontSize: 12,
  },
});
