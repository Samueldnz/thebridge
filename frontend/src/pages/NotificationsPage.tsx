import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Inbox,
  Layers,
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Icon } from "../components/ui/Icon";
import { Button } from "../components/ui/Button";
import { authService } from "../services/auth";
import {
  connectionsService,
  type NotificationItem,
} from "../services/connections";

interface NotificationThread {
  threadId: string;
  connectionId?: string;
  projectTitle?: string;
  latest: NotificationItem;
  messages: NotificationItem[];
  unreadCount: number;
}

export function NotificationsPage() {
  const [user] = useState(authService.getStoredUser());
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get("id");

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    connectionsService.getNotifications(user?.email)
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("TODAS");

  const allConnections = useMemo(() => connectionsService.getAllConnections(), [notifications]);

  // Agrupa notificações pelo match (connectionId) para que não virem vários e-mails separados
  const threads = useMemo<NotificationThread[]>(() => {
    const map = new Map<string, NotificationItem[]>();

    for (const item of notifications) {
      const key = item.connectionId ? `match-${item.connectionId}` : `single-${item.id}`;
      const existing = map.get(key);
      if (existing) {
        existing.push(item);
      } else {
        map.set(key, [item]);
      }
    }

    const result: NotificationThread[] = [];
    for (const [threadId, msgs] of map.entries()) {
      const latest = msgs[0];
      const connId = latest.connectionId;
      const connObj = connId ? allConnections.find((c) => c.id === connId) : undefined;
      result.push({
        threadId,
        connectionId: connId,
        projectTitle: connObj?.articleTitle,
        latest,
        messages: msgs,
        unreadCount: msgs.filter((m) => !m.read).length,
      });
    }
    return result;
  }, [notifications, allConnections]);

  const [selectedThreadId, setSelectedThreadId] = useState<string>(() => {
    const list = connectionsService.getNotifications(user?.email);
    if (idFromUrl) {
      const matched = list.find((n) => n.id === idFromUrl || `match-${n.connectionId}` === idFromUrl);
      if (matched) {
        return matched.connectionId ? `match-${matched.connectionId}` : `single-${matched.id}`;
      }
    }
    if (list.length > 0) {
      const first = list[0];
      return first.connectionId ? `match-${first.connectionId}` : `single-${first.id}`;
    }
    return "";
  });

  useEffect(() => {
    const list = connectionsService.getNotifications(user?.email);
    setNotifications(list);
    if (!selectedThreadId && list.length > 0) {
      const first = list[0];
      setSelectedThreadId(first.connectionId ? `match-${first.connectionId}` : `single-${first.id}`);
    }
  }, [user?.email]);

  useEffect(() => {
    if (idFromUrl) {
      const targetThread = threads.find(
        (t) => t.threadId === idFromUrl || t.messages.some((m) => m.id === idFromUrl)
      );
      if (targetThread) {
        setSelectedThreadId(targetThread.threadId);
        const idsToMark = new Set(targetThread.messages.map((m) => m.id));
        for (const msgId of idsToMark) {
          connectionsService.markNotificationAsRead(msgId, user?.email);
        }
        setNotifications((prev) =>
          prev.map((n) => (idsToMark.has(n.id) ? { ...n, read: true } : n))
        );
      }
    }
  }, [idFromUrl, user?.email]);

  const selectedThread = threads.find((t) => t.threadId === selectedThreadId) || null;

  const handleSelectThread = (thread: NotificationThread) => {
    setSelectedThreadId(thread.threadId);
    const idsToMark = new Set(thread.messages.map((m) => m.id));
    for (const msgId of idsToMark) {
      connectionsService.markNotificationAsRead(msgId, user?.email);
    }
    setNotifications((prev) =>
      prev.map((n) => (idsToMark.has(n.id) ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    connectionsService.markAllAsRead(user?.email);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredThreads =
    categoryFilter === "TODAS"
      ? threads
      : threads.filter((t) => t.messages.some((m) => m.category === categoryFilter));

  const getCategoryBadge = (category: NotificationItem["category"]) => {
    switch (category) {
      case "CONEXAO":
        return {
          label: "Conexão",
          color: "bg-blue-100 text-blue-900 border-blue-200",
          icon: MessageSquare,
        };
      case "MATCH":
        return {
          label: "Match",
          color: "bg-emerald-100 text-emerald-900 border-emerald-200",
          icon: Sparkles,
        };
      case "PROPOSTA":
        return {
          label: "Proposta",
          color: "bg-purple-100 text-purple-900 border-purple-200",
          icon: CheckCircle2,
        };
      case "SISTEMA":
      default:
        return {
          label: "Sistema",
          color: "bg-slate-100 text-slate-800 border-slate-200",
          icon: ShieldCheck,
        };
    }
  };

  return (
    <DashboardLayout
      title="Central de Notificações"
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={handleMarkAllRead}
          className="text-xs"
        >
          <Icon icon={CheckCircle2} size={14} />
          Marcar todas como lidas
        </Button>
      }
    >
      <div className="bg-surface-white rounded-3xl border border-border-subtle shadow-sm overflow-hidden min-h-[640px] flex flex-col">
        {/* Subheader Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-6 py-3.5 bg-surface-primary">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-heading font-semibold text-text-secondary mr-2 flex items-center gap-1">
              <Icon icon={Filter} size={13} />
              Filtrar:
            </span>
            {["TODAS", "CONEXAO", "MATCH", "SISTEMA"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-heading font-medium transition-all cursor-pointer",
                  categoryFilter === cat
                    ? "bg-brand-green-dark text-white font-bold"
                    : "bg-surface-white border border-border-subtle text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {cat === "TODAS"
                  ? "Todas"
                  : cat === "CONEXAO"
                  ? "Conexões"
                  : cat === "MATCH"
                  ? "Matches"
                  : "Sistema"}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-text-secondary">
            {threads.filter((t) => t.unreadCount > 0).length} conversas não lidas de {threads.length}
          </div>
        </div>

        {/* Master-Detail (Email-Thread Split Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
          {/* Left Column: Grouped Match Threads List */}
          <div className="lg:col-span-5 border-r border-border-subtle overflow-y-auto max-h-[680px] divide-y divide-border-subtle bg-surface-primary/30">
            {filteredThreads.length === 0 ? (
              <div className="p-12 text-center text-text-secondary">
                <Icon icon={Inbox} size={32} className="mx-auto text-text-muted mb-2" />
                <p className="text-sm font-heading font-semibold">Nenhuma notificação encontrada</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const item = thread.latest;
                const isSelected = thread.threadId === selectedThreadId;
                const hasUnread = thread.unreadCount > 0;
                const badge = getCategoryBadge(item.category);

                return (
                  <button
                    key={thread.threadId}
                    type="button"
                    onClick={() => handleSelectThread(thread)}
                    className={[
                      "w-full text-left p-4.5 transition-all flex flex-col gap-1.5 relative cursor-pointer",
                      isSelected
                        ? "bg-emerald-50/70 border-l-4 border-l-brand-green-dark"
                        : "hover:bg-surface-white bg-transparent",
                      hasUnread ? "font-semibold" : "opacity-85",
                    ].join(" ")}
                  >
                    {/* Top Row: Sender, Message Count & Date */}
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-heading font-bold text-text-primary truncate">
                          {item.sender}
                        </span>
                        {thread.messages.length > 1 && (
                          <span className="shrink-0 rounded-md bg-brand-green-dark/10 px-1.5 py-0.5 font-mono text-[13px] font-bold text-brand-green-dark">
                            {thread.messages.length}
                          </span>
                        )}
                      </div>
                      <span className="text-[13px] font-mono text-text-secondary whitespace-nowrap">
                        {item.date}
                      </span>
                    </div>

                    {/* Project / Match Reference if available */}
                    {thread.projectTitle && (
                      <div className="text-[13px] font-heading font-semibold text-brand-green-moss truncate">
                        Match: {thread.projectTitle}
                      </div>
                    )}

                    {/* Middle: Latest Title & Unread indicator */}
                    <div className="flex items-center gap-2">
                      {hasUnread && (
                        <span className="h-2 w-2 rounded-full bg-brand-green-moss shrink-0" />
                      )}
                      <h4
                        className={[
                          "text-xs leading-snug truncate",
                          hasUnread ? "text-text-primary font-bold" : "text-text-secondary",
                        ].join(" ")}
                      >
                        {item.title}
                      </h4>
                    </div>

                    {/* Snippet */}
                    <p className="text-[13px] font-body text-text-secondary line-clamp-2 leading-relaxed">
                      {item.preview}
                    </p>

                    {/* Badges */}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[13px] font-mono font-medium border ${badge.color}`}
                      >
                        <Icon icon={badge.icon} size={10} />
                        {badge.label}
                      </span>
                      {thread.messages.length > 1 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-surface-secondary px-2 py-0.5 text-[13px] font-mono text-text-secondary border border-border-subtle">
                          <Icon icon={Layers} size={11} />
                          {thread.messages.length} mensagens agrupadas
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Grouped Thread Messages View */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between bg-surface-white overflow-y-auto max-h-[680px]">
            {selectedThread ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Thread Header */}
                  <div className="border-b border-border-subtle pb-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-semibold border ${
                            getCategoryBadge(selectedThread.latest.category).color
                          }`}
                        >
                          <Icon
                            icon={getCategoryBadge(selectedThread.latest.category).icon}
                            size={13}
                          />
                          {getCategoryBadge(selectedThread.latest.category).label}
                        </span>
                        {selectedThread.messages.length > 1 && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green-moss/10 border border-brand-green-moss/20 px-3 py-1 text-xs font-mono font-semibold text-brand-green-dark">
                            <Icon icon={Layers} size={13} />
                            {selectedThread.messages.length} atualizações deste Match
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-text-secondary flex items-center gap-1">
                        <Icon icon={Clock} size={12} />
                        Última atualização: {selectedThread.latest.date}
                      </span>
                    </div>

                    <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary leading-tight break-words">
                      {selectedThread.projectTitle
                        ? `Histórico do Match: ${selectedThread.projectTitle}`
                        : selectedThread.latest.title}
                    </h2>
                  </div>

                  {/* Conversation Messages List (Newest to Oldest or Chronological Cards) */}
                  <div className="space-y-4">
                    {selectedThread.messages.map((msg, idx) => {
                      const isLatest = idx === 0;
                      return (
                        <div
                          key={msg.id}
                          className={[
                            "rounded-2xl border p-5 space-y-3 transition-all",
                            isLatest
                              ? "border-brand-green-moss/40 bg-emerald-50/20 shadow-xs"
                              : "border-border-subtle bg-surface-primary/60",
                          ].join(" ")}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle/70 pb-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-heading text-sm font-bold text-text-primary">
                                  {msg.title}
                                </span>
                                {isLatest && selectedThread.messages.length > 1 && (
                                  <span className="rounded-md bg-brand-green-dark px-2 py-0.5 font-mono text-[13px] font-bold text-white">
                                    Mais recente
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                <Icon icon={Mail} size={13} className="text-brand-green-moss" />
                                <span>
                                  De: <strong className="text-text-primary">{msg.sender}</strong>
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-mono text-text-secondary flex items-center gap-1">
                              <Icon icon={Clock} size={12} />
                              {msg.date}
                            </span>
                          </div>

                          <div className="font-body text-sm text-text-primary leading-relaxed whitespace-pre-line">
                            {msg.body}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Action Button */}
                {selectedThread.latest.actionUrl && (
                  <div className="pt-6 border-t border-border-subtle flex justify-end">
                    <Link to={selectedThread.latest.actionUrl}>
                      <Button size="sm" className="bg-brand-green-dark text-white">
                        Acessar Área Relacionada
                        <Icon icon={ArrowRight} size={14} />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 text-text-muted">
                <Icon icon={Bell} size={40} className="mb-3 opacity-40" />
                <h3 className="font-heading text-base font-bold text-text-secondary">
                  Nenhuma notificação selecionada
                </h3>
                <p className="mt-1 font-body text-xs text-text-muted">
                  Selecione uma conversa na lista à esquerda para ler os detalhes completos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

