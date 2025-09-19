import express from 'express';
import cors from 'cors';
import { env } from './config/env';

// Rotas
import authRoutes from './routes/auth.routes';
import usuarioRoutes from './routes/usuario.routes';

// Empresa
import empresaRoutes from './routes/empresa/empresa.routes';

// Faturamento
import faturamentoRoutes from './routes/faturamento.routes';

// Competencia Financeira
import competenciaRoutes from './routes/competenciaFinanceira.routes';

// Despesas
import fornecedorRoutes from './routes/despesas/fornecedor.routes';
import planoContasRoutes from './routes/despesas/planoConta.routes';
import bancoRoutes from './routes/despesas/banco.routes';
import contasPagarRoutes from './routes/despesas/contaPagar.routes';

// Dashboard
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://edelfe.fabricadelaudos.com',
  ],
  credentials: true,
}));

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/usuario", usuarioRoutes);

// Empresa
app.use("/api/empresa", empresaRoutes);

// Faturamento
app.use("/api/faturamento", faturamentoRoutes);

// Competencia Financeira
app.use("/api/competencia", competenciaRoutes);

// Despesas
app.use("/api/banco", bancoRoutes);
app.use("/api/planoConta", planoContasRoutes);
app.use("/api/fornecedor", fornecedorRoutes);
app.use("/api/contaPagar", contasPagarRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

app.listen(env.PORT, () => {
  console.log(`Servidor rodando na porta ${env.PORT}`);
});
