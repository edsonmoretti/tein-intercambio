# TeinViagens - Gerenciador de Viagens

TeinViagens é uma aplicação web de código aberto, construída com o objetivo de simplificar o planejamento e a gestão de viagens, sejam elas de estudo, intercâmbio ou lazer. O projeto nasceu como um sistema de gestão de intercâmbios e foi adaptado para se tornar uma ferramenta mais flexível e abrangente.

## ✨ Funcionalidades Principais

- **Gestão de Viagens:** Crie e gerencie múltiplas viagens, definindo destinos, datas e locais de interesse.
- **Checklist de Tarefas:** Organize todas as suas pendências, desde a compra de passagens até a renovação do passaporte.
- **Planejamento Financeiro:** Crie orçamentos para diferentes categorias (moradia, alimentação, etc.) e acompanhe seus gastos.
- **Lista de Compras:** Planeje os itens que precisa comprar antes e durante a viagem.
- **Gestão de Documentos:** Mantenha um registro de todos os seus documentos importantes, com datas de validade e arquivos anexados.
- **Múltiplos Participantes:** Adicione membros à viagem para organizar tarefas e documentos em família ou em grupo.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando um conjunto de tecnologias modernas, focando em uma experiência de desenvolvimento ágil e uma interface de usuário reativa.

- **Backend:**
  - [Laravel](https://laravel.com/) - Um framework PHP robusto e elegante.
  - [Inertia.js](https://inertiajs.com/) - Para criar aplicações de página única (SPA) sem a complexidade de uma API completa.
- **Frontend:**
  - [React](https://react.dev/) - Uma biblioteca JavaScript para construir interfaces de usuário.
  - [TypeScript](https://www.typescriptlang.org/) - Para adicionar tipagem estática e segurança ao JavaScript.
  - [Tailwind CSS](https://tailwindcss.com/) - Um framework CSS "utility-first" para um design rápido e customizável.
  - [shadcn/ui](https://ui.shadcn.com/) - Uma coleção de componentes de UI reusáveis.

## ⚙️ Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone [URL_DO_SEU_REPOSITORIO]
   cd tein-intercambio
   ```

2. **Instale as dependências:**
   ```bash
   composer install
   npm install
   ```

3. **Configure o ambiente:**
   - Copie o arquivo `.env.example` para `.env`.
   - Gere a chave da aplicação: `php artisan key:generate`
   - Configure as variáveis de banco de dados no arquivo `.env`.

4. **Execute as migrações e os seeders:**
   ```bash
   php artisan migrate --seed
   ```

5. **Inicie os servidores:**
   ```bash
   # Em um terminal
   php artisan serve

   # Em outro terminal
   npm run dev
   ```

Agora você pode acessar a aplicação em `http://localhost:8000`.
