# Como Gerar o seu APK

Para transformar este projeto em um APK para Android, siga estes passos no seu computador:

## 1. Preparação
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
