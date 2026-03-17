-- Conversations table
CREATE TABLE public.soba_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Nova conversa',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.soba_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.soba_conversations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.soba_conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.soba_conversations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Messages table
CREATE TABLE public.soba_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.soba_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.soba_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.soba_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.soba_conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own messages" ON public.soba_messages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.soba_conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own messages" ON public.soba_messages
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.soba_conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));

CREATE INDEX idx_soba_messages_conversation ON public.soba_messages(conversation_id, created_at);
CREATE INDEX idx_soba_conversations_user ON public.soba_conversations(user_id, updated_at DESC);