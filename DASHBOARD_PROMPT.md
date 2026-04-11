# Prompt para Implementação do Dashboard - Conexão Premiada

## Contexto
O sistema agora possui uma funcionalidade de "Conexão Premiada" (Fidelização Física), onde lojistas cadastram vendas físicas para gerar códigos de pontos que profissionais podem resgatar.

## Novos Endpoints Admin
- `GET /admin/dashboard/statistics`: Agora inclui `totalPhysicalSales` e `totalPointsAwardedPhysical`.
- `GET /admin/physical-sales`: Retorna a lista completa de vendas físicas registradas, incluindo o parceiro, o profissional que resgatou (se houver), status de resgate e data.
- `PATCH /admin/partner-suppliers/:id/points-limit`: Permite ao administrador definir ou atualizar o limite de pontos que um parceiro pode distribuir.

## Requisitos de UI (Dashboard Admin)

### 1. Estatísticas Gerais
- Adicionar dois novos cards ou atualizar os existentes para mostrar:
  - **Total de Vendas Físicas**: Quantidade total de códigos gerados no sistema.
  - **Pontos Distribuídos (Físico)**: Soma total de pontos que já foram resgatados via códigos físicos.

### 2. Gestão de Parceiros (Lista de Lojistas)
- Adicionar uma coluna ou uma ação para "Gerenciar Limite de Pontos".
- Ao clicar, abrir um modal para editar o `pointsLimit` do parceiro selecionado.
- Mostrar o consumo atual (`currentPointsAwarded` / `pointsLimit`).

### 3. Nova Tela: Histórico de Conexão Premiada
- Criar uma tabela para listar todas as vendas físicas (`/admin/physical-sales`).
- Colunas sugeridas:
  - Código
  - Loja/Parceiro
  - Cliente (Nome na venda)
  - Valor da Venda
  - Profissional (Email de quem resgatou)
  - Status (Resgatado / Pendente)
  - Data de Criação

## Requisitos de UI (Painel do Lojista)

### 1. Registro de Venda
- Tela com formulário para o lojista cadastrar:
  - Nome do Cliente
  - Valor da Venda
  - Vendedor (Opcional)
  - Nota Fiscal (Opcional)
- Após o cadastro bem-sucedido, exibir o **Código Único** gerado de forma destacada para que o lojista entregue ao cliente.

## Requisitos de UI (App do Profissional)

### 1. Resgate de Pontos
- Campo de entrada para o profissional digitar o código recebido na loja física.
- Botão "Resgatar Pontos".
- Feedback de sucesso mostrando quantos pontos foram ganhos.
