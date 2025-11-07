# Yard Registration 

Este repositório contém a **interface web** utilizada pelos **gestores** do sistema **Pulse** para realizar o **cadastro e gerenciamento de pátios (Parkings)**.  
A aplicação é desenvolvida em **React**, consumindo a API backend construída em **.NET**.

## 🌐 Sobre o Projeto

O **Pulse Parking Web** é um painel administrativo que permite:

- Cadastrar novos pátios  
- Visualizar pátios existentes  
- Atualizar informações  
- Cadastrar zonas internas  
- Associar gateways ao pátio  
- Enviar plantas estruturais (arquivos)  
- Validar todos os campos via formulário  

O objetivo é oferecer uma interface simples e eficiente para gestão dos estacionamentos que compõem o ecossistema Pulse.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Função |
|-----------|--------|
| **React (Create React App)** | Frontend da aplicação |
| **React Konva / Konva** | Canvas e manipulação gráfica |
| **React RND** | Drag & resize de elementos |
| **React Router DOM** | Navegação |
| **Testing Library** | Testes |
| **Web Vitals** | Métricas de desempenho |

---

## 🔗 Integração com API Backend .NET

A interface consome endpoints fornecidos por uma API desenvolvida em **.NET 8**.

👉 **API Backend .NET**  
https://github.com/ChallengeMottu/ParkingRegistration.git

---

## ▶️ Como Rodar o Projeto

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar a aplicação
```bash
npm start
```

### A aplicação ficará disponível em:
```bash
http://localhost:3000
```

---

## Status atual
- ✔️ Funcionalidades principais de desenho
- ✔️ Integração básica com API
- ⏳ Ajustes visuais e melhorias de UX
- ⏳ Suporte para múltiplas zonas e camadas avançadas




---
