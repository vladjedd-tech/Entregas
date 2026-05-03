# Como Gerar o seu APK

Para transformar este projeto em um APK para Android, você tem duas opções:

## Importante: Novas Correções
Eu fiz melhorias críticas no GPS e no Mapa:
1. **GPS Nativo:** Agora o app usa o plugin oficial do celular para garantir que a localização funcione no APK.
2. **Mapa Inteligente:** O mapa agora mostra **apenas** os pedidos que estão na rota azul, e ajusta o zoom sozinho para você ver todos os pontos.
3. **Indicador de Mapeamento:** No topo do app, aparecerá **"Mapeando..."** enquanto ele busca as coordenadas dos novos pedidos. Isso leva cerca de 1.2 segundos por pedido (limite do serviço de mapas).
4. **Alerta "Sem GPS":** Se um pedido aparecer com um selo vermelho **"Sem GPS"**, significa que o endereço não foi encontrado no mapa. Verifique se o endereço está correto e inclui a cidade (ex: "Rua X, 100, Pato Branco").

**Para aplicar estas mudanças, você precisa clicar em "Export to GitHub" novamente e gerar um novo APK seguindo os passos da Opção 1.**

Eu já configurei tudo para o novo nome **"Entregas Sexta Beer"** e corrigi o erro de compilação no GitHub.

### O ícone já está pronto!
Como você já adicionou o arquivo `Icon.png` na pasta `public/`, eu já deixei o sistema configurado para transformar essa imagem automaticamente no ícone oficial do aplicativo e na tela de abertura (Splash Screen) durante a próxima compilação.

**Para gerar o novo APK com o ícone:**
1. Clique em **"Export to GitHub"**.
2. Vá no seu GitHub e rode o workflow em **Actions > Build Android APK**.

---

## Opção 1: Automático via GitHub (Recomendado)
Eu já corrigi as versões do aplicativo e configurei o sistema para gerar o APK sozinho.
Siga estes passos:

1. Clique em **"Export to GitHub"** aqui no AI Studio para enviar as correções que acabei de fazer.
2. No seu GitHub, vá na aba **"Actions"**.
3. Clique em **"Build Android APK"**.
4. Clique em **"Run workflow"** (Botão no lado direito) -> **"Run workflow"** (Botão verde).
5. Quando o círculo ficar verde com um "check", clique no nome do processo ("Build Android APK").
6. No final da página (seção **Artifacts**), clique em **"app-debug"** para baixar seu APK!

> **Nota sobre o GPS:** Eu adicionei o plugin oficial do Capacitor e configurei o GitHub para injetar automaticamente as permissões no APK. Agora, ao abrir o app no Android pela primeira vez, ele deve pedir permissão para acessar sua localização.

## Opção 2: Manual no seu Computador
Siga estes passos se preferir compilar localmente:

### 1. Preparação
Você precisará ter instalado:
- **Node.js**
- **Android Studio**

## 2. Exportar o projeto
1. Clique no ícone de engrenagem (Configurações) aqui no AI Studio.
2. Escolha **Export to GitHub** ou **Download ZIP**.

## 3. Comandos de Compilação
Abra o terminal na pasta do projeto e execute:

```bash
# Instalar dependências
npm install

# Instalar o Capacitor (ferramenta que cria o APK)
npm install @capacitor/core @capacitor/cli @capacitor/android

# Inicializar o Capacitor
npx cap init "Motorista Entrega" "com.entregas.app" --web-dir dist

# Gerar a versão web
npm run build

# Adicionar a plataforma Android
npx cap add android

# Copiar os arquivos para a pasta Android
npx cap copy

# Abrir no Android Studio para gerar o APK
npx cap open android
```

## 4. No Android Studio
- Vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
- O Android Studio vai gerar o arquivo `.apk` que você pode instalar no seu celular.

---
**Dica:** Como este app usa GPS (Geolocalização), ao instalar o APK, o celular pedirá permissão para acessar sua localização.
