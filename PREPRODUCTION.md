# Pré-produção — Ecossistema de Mídia Regional

Branch: `release/pre-production`

Objetivo: validar a integração das Fases 1–6 em Preview antes de qualquer publicação em produção.

## Regras desta release

- Não publicar em produção sem autorização explícita.
- Preservar a `main` como ponto seguro de restauração.
- Preservar o layout público aprovado da Fase 1 durante a integração final.
- Usar somente o projeto Vercel existente `ecossistema-midia-regional`.
- Não criar projeto Vercel duplicado.
- Não ativar gateway de pagamento ou provedor de streaming pago sem aprovação.
- Validar autenticação, permissões, isolamento multi-tenant/RLS, Admin/ERP, catálogo Premium e rotas públicas no Preview.

## Estado de entrada

A branch foi criada a partir da `phase-6` após hardening de segurança, CI verde e testes de isolamento RLS. Este commit existe para identificar e disparar o Preview específico da release de pré-produção.
