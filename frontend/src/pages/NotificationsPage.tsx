import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Icon } from "../components/ui/Icon";
import { Button } from "../components/ui/Button";
import {
  connectionsService,
  type NotificationItem,
} from "../services/connections";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    connectionsService.getNotifications()
  );
  const [selectedId, setSelectedId] = useState<string>(() =>
    notifications.length > 0 ? notifications[0].id : ""
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("TODAS");

  const selectedNotification = notifications.find((n) => n.id === selectedId) || null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    connectionsService.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    connectionsService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered =
    categoryFilter === "TODAS"
      ? notifications
      : notifications.filter((n) => n.category === categoryFilter);

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
                  "rounded-full px-3 py-1 text-xs font-heading font-medium transition-all",
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
            {notifications.filter((n) => !n.read).length} não lidas de {notifications.length}
          </div>
        </div>

        {/* Master-Detail (Email-like Split Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
          {/* Left Column: Notification Item List */}
          <div className="lg:col-span-5 border-r border-border-subtle overflow-y-auto max-h-[680px] divide-y divide-border-subtle bg-surface-primary/30">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-text-secondary">
                <Icon icon={Inbox} size={32} className="mx-auto text-text-muted mb-2" />
                <p className="text-sm font-heading font-semibold">Nenhuma notificação encontrada</p>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = item.id === selectedId;
                const badge = getCategoryBadge(item.category);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={[
                      "w-full text-left p-4.5 transition-all flex flex-col gap-1.5 relative",
                      isSelected
                        ? "bg-emerald-50/70 border-l-4 border-l-brand-green-dark"
                        : "hover:bg-surface-white bg-transparent",
                      !item.read ? "font-semibold" : "opacity-85",
                    ].join(" ")}
                  >
                    {/* Top Row: Sender & Date */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-heading font-bold text-text-primary truncate max-w-[200px]">
                        {item.sender}
                      </span>
                      <span className="text-[11px] font-mono text-text-secondary whitespace-nowrap">
                        {item.date}
                      </span>
                    </div>

                    {/* Middle: Title & Unread indicator */}
                    <div className="flex items-center gap-2">
                      {!item.read && (
                        <span className="h-2 w-2 rounded-full bg-brand-green-moss shrink-0" />
                      )}
                      <h4
                        className={[
                          "text-xs leading-snug truncate",
                          !item.read ? "text-text-primary font-bold" : "text-text-secondary",
                        ].join(" ")}
                      >
                        {item.title}
                      </h4>
                    </div>

                    {/* Snippet */}
                    <p className="text-[11px] font-body text-text-secondary line-clamp-2 leading-relaxed">
                      {item.preview}
                    </p>

                    {/* Badge */}
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-medium border ${badge.color}`}
                      >
                        <Icon icon={badge.icon} size={10} />
                        {badge.label}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Full Message View */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between bg-surface-white">
            {selectedNotification ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Message Header */}
                  <div className="border-b border-border-subtle pb-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-semibold border ${
                          getCategoryBadge(selectedNotification.category).color
                        }`}
                      >
                        <Icon
                          icon={getCategoryBadge(selectedNotification.category).icon}
                          size={13}
                        />
                        {getCategoryBadge(selectedNotification.category).label}
                      </span>
                      <span className="text-xs font-mono text-text-secondary flex items-center gap-1">
                        <Icon icon={Clock} size={12} />
                        {selectedNotification.date}
                      </span>
                    </div>

                    <h2 className="font-display text-2xl font-bold text-text-primary leading-tight">
                      {selectedNotification.title}
                    </h2>

                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Icon icon={Mail} size={14} className="text-brand-green-moss" />
                      <span>
                        De: <strong className="text-text-primary">{selectedNotification.sender}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="pt-6 font-body text-sm text-text-primary leading-relaxed whitespace-pre-line space-y-4">
                    {selectedNotification.body}
                  </div>
                </div>

                {/* Footer Action Button */}
                {selectedNotification.actionUrl && (
                  <div className="pt-6 border-t border-border-subtle flex justify-end">
                    <Link to={selectedNotification.actionUrl}>
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
                  Selecione uma notificação na lista à esquerda para ler os detalhes completos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
