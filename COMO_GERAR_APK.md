# Como Gerar o seu APK

Para transformar este projeto em um APK para Android, você tem duas opções:

## Opção 1: Automático via GitHub (Recomendado)
Eu já corrigi as versões do aplicativo e configurei o sistema para gerar o APK sozinho.
Siga estes passos:

1. Clique em **"Export to GitHub"** aqui no AI Studio para enviar as correções que acabei de fazer.
2. No seu GitHub, vá na aba **"Actions"**.
3. Clique em **"Build Android APK"**.
4. Clique em **"Run workflow"** (Botão no lado direito) -> **"Run workflow"** (Botão verde).
5. Quando o círculo ficar verde com um "check", clique no nome do processo ("Build Android APK").
6. No final da página (seção **Artifacts**), clique em **"app-debug"** para baixar seu APK!

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
