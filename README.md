# Soven Shopify Theme

O tema editável está em `theme/`. Os arquivos ZIP do export original foram preservados.

## Prévia

```sh
npx @shopify/cli theme dev --store k31trh-bs.myshopify.com --path theme
```

Requer acesso autorizado à loja Shopify.

## Alterações

- Barra de promoção animada em espanhol, com fundo preto.
- Página Soven Roma com título simplificado, descrição em espanhol e fotos padronizadas para as nove variantes.
- Carrossel de imagens ilustrativas de pessoas fictícias geradas por IA.
- Bundle com uma unidade ou três unidades, seletores de variante e visual arredondado.
- Selos de pagamento PayPal e cartões, com ajustes de espaçamento no celular.

As fotos usadas pela página estão em `theme/assets/` e fazem parte do repositório. Os arquivos intermediários de geração e revisão ficam em `artifacts/`, fora do versionamento.

## Publicação e desconto

Enviar commits ao GitHub não atualiza automaticamente o cadastro de produtos da Shopify. As substituições de fotos são feitas pelo tema para o Soven Roma. A loja pública precisa usar a versão atualizada do tema para exibi-las.

O desconto do bundle precisa ser configurado na Shopify. A opção `roma_bundle_discount_ready` deve ser ativada somente após a configuração do desconto 3x2 para as variantes individuais, excluindo os kits. O código `roma_bundle_discount_code` é opcional quando o desconto é automático. A compra do pack permanece bloqueada enquanto o desconto não estiver habilitado no tema ou houver itens indisponíveis.
