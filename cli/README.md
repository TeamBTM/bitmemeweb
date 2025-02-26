# Juno Network CLI Tool

Una herramienta de línea de comandos para interactuar con Juno Network, permitiendo verificar saldos y realizar operaciones tanto en mainnet como testnet.

## Requisitos Previos

- Node.js (v16 o superior)
- npm (viene con Node.js)
- Una wallet de Juno (puedes crear una con Keplr)

## Instalación

1. Clona este repositorio:
```bash
git clone <repository-url>
cd cli
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo .env y agrega tu frase mnemónica:
```
JUNO_MNEMONIC="tu frase mnemónica de 12 palabras aquí"
```

4. Haz el CLI ejecutable (solo Unix/Linux/Mac):
```bash
chmod +x src/index.js
```

## Uso

### Verificar Saldo

Para mainnet:
```bash
node src/index.js balance
```

Para testnet:
```bash
node src/index.js balance --testnet
```

## Arquitectura

El proyecto está organizado en tres capas principales:

1. **Blockchain Layer**
   - Interacción directa con Juno Network
   - Manejo de transacciones y consultas
   - Integración con CosmJS

2. **Backend Services**
   - Procesamiento de datos
   - Manejo de configuración
   - Gestión de conexiones

3. **CLI Frontend**
   - Interfaz de línea de comandos
   - Manejo de comandos y opciones
   - Presentación de datos al usuario

## Seguridad

- Nunca compartas tu frase mnemónica
- Guarda tu archivo .env de forma segura
- Considera usar una wallet diferente para testnet

## Redes Disponibles

### Mainnet
- Chain ID: juno-1
- RPC: https://juno-rpc.polkachu.com

### Testnet
- Chain ID: uni-6
- RPC: https://juno-testnet-rpc.polkachu.com