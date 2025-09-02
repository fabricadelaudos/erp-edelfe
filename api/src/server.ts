import express from 'express';
import cors from 'cors';
import { env } from './config/env';

// Rotas
import authRoutes from './routes/auth.routes';

// Empresa
import empresaRoutes from './routes/empresa/empresa.routes';

// Faturamento
import faturamentoRoutes from './routes/faturamento.routes';

// Competencia Financeira
import competenciaFinanceiraRoutes from './routes/competenciaFinanceira.routes';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use("/api", authRoutes);

// Empresa
app.use("/api/empresa", empresaRoutes );

// Faturamento
app.use("/api/faturamento", faturamentoRoutes );

// Competencia Financeira
app.use("/api/competencia", competenciaFinanceiraRoutes );

app.listen(env.PORT, () => {
  console.log(`Servidor rodando na porta ${env.PORT}`);
});
