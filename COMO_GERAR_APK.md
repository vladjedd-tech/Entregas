# Como Gerar o seu APK

Para transformar este projeto em um APK para Android, você tem duas opções:

## Opção 1: Automático via GitHub (Recomendado)
Eu já configurei um "Workflow" no seu projeto. Quando você exportar para o GitHub, o APK será gerado automaticamente!

1. Exporte o projeto para o seu **GitHub**.
2. No seu repositório no GitHub, clique na aba **"Actions"**.
3. Você verá um item chamado **"Build Android APK"**.
4. Se ele não começar sozinho, clique nele e depois em "Run workflow".
5. Ao finalizar (o ícone ficará verde), clique no nome do processo e role até o final da página para baixar o arquivo **"app-debug"** (que é o seu APK).

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
