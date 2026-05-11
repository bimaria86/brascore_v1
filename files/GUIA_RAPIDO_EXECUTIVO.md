# Projeto BraSCORE - GUIA RÁPIDO EXECUTIVO

 
**Status: Fase de Transição**

---

## OVERVIEW DO PROJETO

```
Plataforma web de monitoramento de cirurgias cardíacas
├── Centros (distribuídos no Brasil)
├── Pacientes elegíveis em coleta
├── 147 Variáveis clinicamente relevantes
├── 2FA + LGPD compliant
└── Análise de escore de risco (Python)
```

---


## TELA A TELA - O QUE VOCÊ TEM

| Tela | Nome | Campos | Status |
|------|------|--------|--------|
| **0** | Identificação | 11 | Pronto |
| **1** | Fatores de Risco | 22 | Pronto |
| **2** | Lab e Testes | 16 | Pronto |
| **3** | Estado Cardíaco | 19 | Pronto |
| **4** | Cirurgia Geral | 8 | Pronto |
| **5** | Revascularização | 30 | Pronto |
| **6** | Valvas | 16 | Pronto |
| **7** | CEC | 19 | Pronto |
| **8** | Pós-OP Imediato | 20 | Pronto |
| **9** | Seguimento 30d | 13 | Pronto |
| **10** | Observações | Free text | Pronto |

**Total: 147 variáveis em uso**

---

## SEGURANÇA & LGPD - STATUS

| Requisito | Status | Ação |
|-----------|--------|------|
| Encriptação (nome, CPF) | Implementada AES-256 |
| 2FA | Implementado |
| Audit logs | Pronto | Habilitar em DB |
| Isolamento por centro | Sim | Queries with hospital_id |
| Retenção de dados | Policy | 15 anos pós-cirurgia |
| Direito ao esquecimento | Script | Soft delete + anonymize |

---

## BANCO DE DADOS 

### Tabelas Principais

```
hospitals
│
├─ patients
│  ├─ clinical_risk_factors
│  ├─ lab_tests
│  ├─ echocardiography
│  ├─ surgical_procedures
│  ├─ ecmo_support
│  ├─ postoperative_outcomes
│  └─ follow_up_30_days
│
├─ audit_logs (rastreamento LGPD)
└─ users 
```

### Relacionamentos
- **1 hospital : N patients**
- **1 patient : 1 risk_factors, 1 surgical_proc, N lab_tests**
- **Soft delete** everywhere (flag `deleted_at`)

---

## SISTEMA DE UPLOAD (Roadmap)

### Fluxo Simplificado

```
1. Centro faz login (2FA)
2. Baixa TEMPLATE Excel
3. Preenche planilha
4. Upload arquivo
5. Sistema VALIDA:
   - Tipos de dados
   - Valores permitidos
   - Fórmulas (ex: BMI)
6. Relatório de ERROS (se houver)
7. Se OK → Importar DB
8. Confirmação: "X linhas importadas"
```

### Template Excel

```
Coluna A: med_record (obrigatório)
Coluna B: nome
Coluna C: idade
...
Coluna N: data_alta

Total: 147 colunas + 2.267 linhas (ajustar por centro)
```

---

## DASHBOARDS 

### Dashboard 1: Visão por Centro

**Cada hospital vê (isolado):**
- Total pacientes (mês, 90d, total)
- Distribuição idade/gênero
- Fatores risco mais comuns (diabetes, HAS, fibrilação)
- Taxa mortalidade pós-OP
- Complicações (infecção, AKI, MI, stroke)
- Tempo internação (UTI + total)

**Gráficos:**
- Gráfico pizza: Tipo de procedimento (CABG vs Valvas)
- Gráfico barras: Idade vs Sexo
- Gráfico linha: Tempo internação (dias)

### Dashboard 2: Análise Global (Admin)

**Dados agregados (sem identificadores):**
- Comparação entre regiões (Norte, NE, CO, SE, S)
- Densidade de centros por região
- Mortalidade por centro (ranking)
- Outliers: centros com desvio padrão alto

---

## 📞 TIME DE TRABALHO

| Role | Responsabilidades |
|------|------------------|
| **Coordenador Geral** | Estratégia, patrocínio, comunicação |
| **Tech Lead** | Arquitetura, código, banco de dados |
| **Data Scientist** | Escore de risco (Python), análises |
| **Frontend Dev** | Dashboards, interface, UX |
| **Backend Dev** | API, upload, validação |
| **Cirurgião Comitê** | Validação de dados e fórmulas |
| **Estatístico** | Análises, publicações |
| **DevOps** | Deploy, segurança, monitoring |

---

## PALAVRA-CHAVE

> **"Plataforma descentralizada de coleta dados com validação comunitária"**

Cada centro é responsável por seus dados.  
Sistema garante qualidade via validação automática.  
Dashboards mostram resultados **isolados por centro**.  
Apenas admin vê visão global de-identificada, conforme LGPD.

---

## ⚡ QUICK START

1. **Leia:** `BRASCORE_DOCUMENTACAO_TECNICA.md`
2. **Verifique:** Todas as 147 variáveis em `BRASCORE_CODEBOOK_COMPLETO.txt`



---

**Versão 1.0 | Maio 2026 | Todos os direitos reservados**

