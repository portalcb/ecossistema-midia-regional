# Fase 6 — Streaming

Branch isolada: `phase-6`, criada a partir do fechamento da `phase-5`.

## Escopo autorizado
- Séries
- Temporadas
- Episódios
- Provedor de vídeo
- Controle de acesso premium
- Histórico de reprodução
- Favoritos
- Métricas

## Regras de execução
- Não publicar em produção sem autorização explícita.
- Não ativar serviço de vídeo pago sem aprovação prévia de custo/provedor.
- Não hospedar vídeo premium diretamente na Vercel.
- Manter vídeos públicos no fluxo YouTube existente.
- Preparar integração de provedor premium por configuração/variáveis de ambiente, sem credenciais no repositório.
- Controle de acesso deve depender de assinatura elegível, sem simular acesso pago.
- Métricas devem usar somente eventos reais registrados.
- Preservar identidade visual e módulos das fases anteriores.

## Entregáveis
1. Modelo de dados de catálogo de streaming.
2. Administração de séries, temporadas e episódios.
3. Camada configurável de provedor de vídeo.
4. Controle de entitlement/acesso premium.
5. Histórico de reprodução e progresso.
6. Favoritos.
7. Métricas reais de consumo.
8. Área premium preparada para catálogo e player seguro.
9. Auditoria, validação, CI e relatório final.

## Estado inicial
Nenhum provedor externo pago será ativado nesta etapa inicial. O catálogo e a governança de acesso serão implementados primeiro.