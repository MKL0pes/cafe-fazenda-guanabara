# Café Fazenda Guanabara

Site da marca Café Fazenda Guanabara: café 100% arábica, torrado em grãos, de Ibiraci, no Sul de Minas.

## O que tem no site

- Entrada animada com o logo em forma de xícara
- Rolagem guiada "Da lavoura à xícara" (verde, de vez, maduro, seco, na xícara)
- Seção "Ibiraci, no Sul de Minas"
- Embalagem de 250 g em 3D, interativa (arraste, setas do teclado, botões Frente e Verso)
- Pedido pelo WhatsApp com mensagem pronta e quantidade de pacotes
- Guia de preparo: quantidade de café, moagem e tempo para coado, prensa francesa e cafeteira italiana
- Links para WhatsApp (61) 99294-7316 e Instagram @cafefazendaguanabaraa

## Como rodar

É um site estático, sem etapa de build. Use qualquer servidor local:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Abrir o `index.html` direto no navegador não funciona, porque o modelo 3D usa módulos JavaScript.

## Estrutura

```
index.html        página única
css/style.css     estilos
js/main.js        interações, rolagem, guia de preparo, pedido
js/bag3d.js       embalagem 3D (three.js)
assets/img/       fotos otimizadas (WebP) e logo recortado
assets/fonts/     Bricolage Grotesque e Newsreader (locais)
vendor/           three.js (MIT)
```

## Onde mudar as informações

- Telefone do WhatsApp: constante `WA_NUMBER` em `js/main.js` e links `wa.me` em `index.html`
- Instagram: links em `index.html`
- Textos do rótulo da embalagem 3D: funções `paintFront` e `paintBack` em `js/bag3d.js`
- Proporção de café por método: objeto `METHODS` em `js/main.js`

## Fotos

As fotos mantêm a resolução original enviada (cerca de 960 px de largura). Para telas grandes ou retina, substitua por versões maiores em `assets/img/` com o mesmo nome.
