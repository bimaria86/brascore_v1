# 📋 BraSCORE - Documentação Técnica Completa

**Data:** Dezembro 2023 a Dezembro de 2026
**Versão:** 1.0
**Status:** Em Transição
**Escopo:** Plataforma de Monitoramento e Análise de Cirurgias Cardíacas

---

## Índice

1. [Visão Geral do Projeto](#visão-geral)
2. [Arquitetura Técnica](#arquitetura-técnica)
3. [Codebook de Variáveis](#codebook)
4. [Especificação do Banco de Dados](#banco-dados)
5. [Segurança e LGPD](#lgpd)
6. [Sistema de Upload de Dados](#upload)
7. [API REST (Roadmap)](#api)
8. [Dashboards e Análises](#dashboards)


---

## Visão Geral {#visão-geral}

### O que é BraSCORE?

Plataforma **web-based** descentralizada para coleta, validação e análise de dados de cirurgias cardíacas em múltiplos centros brasileiros.

### Objetivos

- Coleta padronizada de dados
- Cálculo de escore de risco cirúrgico (integrado com Python)
- Dashboards por instituição e análise global (apenas admin)
- Controle de acesso por perfil de usuário
- Isolamento de dados (cada centro vê apenas seu)
- Relatórios com gráficos e tabelas sumarizadas
- Conformidade LGPD (rastreamento, segurança, consentimento)

### Fases

| Fase | Objetivo | Timeline |
|------|----------|----------|
| **1. Transição** | Refatorar banco, upload seguro, validação | 1-2 meses |
| **2. MVP** | API básica + Dashboard de exemplo | Após congresso |
| **3. Produção** | API completa + Dashboards finais + Relatórios | 3-4 meses |

---

## Arquitetura Técnica {#arquitetura-técnica}

### Stack Tecnológico Atual

```
Frontend (Existente)
├── GitHub Pages (grátis)
├── Domínio: projetobrascore.com.br
└── Framework: (HTML/CSS/JS ou SPA)

Backend (Em Transição)
├── Framework: Laravel (PHP)
├── ORM: Eloquent (ou SQL puro)
├── Autenticação: 2FA (já implementado)
└── Python Integration: Scripts de cálculo/queries

Banco de Dados
├── MySQL/MariaDB
├── 10 tabelas principais (refatoradas)
├── 147 variáveis ativas
└── Isolamento por centro (institução_id)

Análises
├── Python (queries + cálculos)
├── Escore de risco (em desenvolvimento)
└── Dashboards (Metabase ou custom)
```

### Diagrama de Fluxo de Dados

```
┌─────────────────────────────────────────┐
│    Frontend (projetobrascore.com.br)    │
│  - Autenticação 2FA                     │
│  - Upload de planilhas (30 centros)     │
│  - Visualização de dados (isolado)      │
│  - Relatórios (gráficos/tabelas)        │
└────────────────┬────────────────────────┘
                 │ API REST
                 ▼
┌─────────────────────────────────────────┐
│    Backend (Laravel + PHP)              │
│  - Validação de dados                   │
│  - Transformação (Python)               │
│  - Cálculo de scores                    │
│  - Controle de permissões               │
│  - Logging (LGPD)                       │
└────────────────┬────────────────────────┘
                 │ Query/ORM
                 ▼
┌─────────────────────────────────────────┐
│    MySQL Database                       │
│  - Tabelas normalizadas                 │
│  - Sem dados soltos                     │
│  - Relacionamentos definidos            │
│  - Histórico de mudanças                │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Análises (Python + Dashboards)       │
│  - Escore de risco                      │
│  - Análises estatísticas                │
│  - Gráficos interativos                 │
│  - Relatórios PDF                       │
└─────────────────────────────────────────┘
```

---

## Codebook de Variáveis {#codebook}

### Resumo Executivo

- **Total de variáveis:** 147 (em uso)
- **Variáveis órfãs:** ~80 (a limpar)
- **Tipos de dados:** Numérica, Categórica, Data, Texto
- **10 telas de entrada:** Divididas por tema clínico

### Estrutura de Variáveis (Simplificada)

#### **TELA 0: Identificação (Requeridas)**

| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `patient_id` | UUID | Único, PK | Identificador único do paciente |
| `hospital_id` | INT | FK | Centro/Instituição |
| `med_record` | VARCHAR | Único por hospital | Registro hospitalar da instituição |
| `age` | INT | 0-120 | Idade em anos |
| `name` | VARCHAR | Max 255 | Nome completo |
| `gender` | ENUM | (M,F) | Sexo biológico |
| `admission_date` | DATE | Requerido | Data de entrada |
| `admission_type` | ENUM | (Eletiva, Urgência, Emergência, Salvamento) | Tipo de admissão |
| `cpf` | VARCHAR | Validar (opcional) | CPF para identificação |

#### **TELA 1: Fatores de Risco**

| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `weight_kg` | FLOAT | 20-300 | Peso em quilogramas |
| `height_cm` | FLOAT | 100-250 | Altura em centímetros |
| `bmi` | FLOAT | Calculado (peso/(altura²)) | Índice de Massa Corporal |
| `diabetes` | ENUM | (Sim, Não) | Diagnóstico de diabetes |
| `diabetes_control` | ENUM | (Sem controle, Dieta, Oral, Insulina, Outras) | Controle glicêmico |
| `dialysis` | ENUM | (Sim, Não) | Em diálise? |
| `covid19` | ENUM | (Negativa, Leve, Moderada, Severa) | Infecção COVID-19 |
| `covid19_date` | DATE | Condicional se sim | Data do diagnóstico |
| `covid19_vaccine_status` | ENUM | (Completa, Incompleta) | Situação vacinal |
| `hypertension` | ENUM | (Sim, Não) | Hipertensão arterial |
| `endocarditis` | ENUM | (Sim, Não) | Endocardite? |
| `endocarditis_type` | ENUM | (Ativa, Tratada) | Tipo de endocardite |
| `copd` | ENUM | (Sim, Não) | DPOC? |
| `copd_severity` | ENUM | (Leve, Moderada, Severa) | Gravidade da DPOC |
| `liver_disease` | ENUM | (Sim, Não) | Doença hepática? |
| `child_pugh_class` | ENUM | (A, B, C) | Classificação Child-Pugh |
| `cancer_5years` | ENUM | (Sim, Não) | Câncer nos últimos 5 anos? |
| `cancer_status` | ENUM | (Remissão, Tratamento ativo) | Status oncológico |

#### **TELA 2: Exames e Testes Funcionais**

| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `hemoglobin_mg` | FLOAT | 1-50 | Hemoglobina (mg/dL) |
| `hematocrit_pct` | FLOAT | 1-99.99 | Hematócrito (%) |
| `leukocytes_mm3` | INT | 1000-99000 | Leucócitos (/mm³) |
| `creatinine_mg` | FLOAT | 0.1-30 | Creatinina (mg/dL) |
| `a1c_pct` | FLOAT | 1-20 | Hemoglobina glicosilada (%) |
| `ejection_fraction_pct` | INT | 1-99 | Fração de ejeção VE (%) |
| `spap_pct` | INT | Validar range | SPAP (%) |
| `valve_disease` | ENUM | (Aórtica, Mitral, Tricúspide, Pulmonar) | Válvula acometida |
| `aortic_stenosis_sev` | ENUM | (Leve, Moderado, Severo, Não doc) | Gravidade estenose aórtica |
| `mitral_stenosis_sev` | ENUM | (Leve, Moderado, Severo, Não doc) | Gravidade estenose mitral |
| `tricuspid_stenosis_sev` | ENUM | (Leve, Moderado, Severo, Não doc) | Gravidade estenose tricúspide |
| `pulmonary_stenosis_sev` | ENUM | (Leve, Moderado, Severo, Não doc) | Gravidade estenose pulmonar |
| `aortic_insufficiency_sev` | ENUM | (Leve, Moderado, Severo, Não doc) | Gravidade insuficiência aórtica |
| `mitral_insufficiency_sev` | ENUM | (Leve, Moderado, Severo, Não doc) | Gravidade insuficiência mitral |
| `tricuspid_insufficiency_sev` | ENUM | (Leve, Moderado, Severo, Não doc) | Gravidade insuficiência tricúspide |
| `pulmonary_insufficiency_sev` | ENUM | (Leve, Moderado, Severo, Não doc) | Gravidade insuficiência pulmonar |

#### **TELAS 3-10: Detalhes Cirúrgicos**

(Resumido por espaço - veja arquivo completo)

| Tela | Tema | Exemplos |
|------|------|----------|
| **3** | Estado Cardíaco Pré-OP | Classe NYHA, Sintomas, Arritmias |
| **4** | Cirurgia - Dados Gerais | Data, Scores (STS, SP), Fragilidade |
| **5** | Revascularização Miocárdio | Enxertos, Artérias, Anastomoses |
| **6** | Procedimentos Valvares | Trocas/Plastias, Próteses |
| **7** | Circulação Extracorpórea (CEC) | Tempos, Cardioplegia, Temperatura |
| **8** | Pós-Operatório Imediato | Intubação, UTI, Complicações |
| **9** | Desfechos em 30 dias | Readmissão, Infecção, Eventos |
| **10** | Seguimento | Status, Óbito, Causa |

---

## 🗄️ Especificação do Banco de Dados {#banco-dados}

### Tabelas Principais (Estrutura Refatorada)

#### 1. **hospitals** (Centros/Instituições)

```sql
CREATE TABLE hospitals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  city VARCHAR(100),
  state CHAR(2),
  director_name VARCHAR(255),
  director_email VARCHAR(255),
  contact_phone VARCHAR(20),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. **patients** (Dados demográficos)

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  hospital_id INT NOT NULL,
  med_record VARCHAR(50) NOT NULL,
  name VARCHAR(255) ENCRYPTED,  -- LGPD: criptografia
  cpf VARCHAR(20) ENCRYPTED,    -- LGPD: criptografia
  gender ENUM('M', 'F', 'Other') NOT NULL,
  age INT NOT NULL,
  weight_kg FLOAT,
  height_cm FLOAT,
  bmi FLOAT GENERATED ALWAYS AS (weight_kg / POWER(height_cm/100, 2)) STORED,
  admission_date DATE NOT NULL,
  admission_type ENUM('Eletiva', 'Urgência', 'Emergência', 'Salvamento'),
  phone VARCHAR(20) ENCRYPTED,
  health_plan VARCHAR(100),
  consent_sign BOOLEAN DEFAULT FALSE,  -- LGPD: TCLE
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  UNIQUE KEY unique_med_record (hospital_id, med_record),
  INDEX idx_hospital (hospital_id),
  INDEX idx_admission_date (admission_date)
);
```

#### 3. **clinical_risk_factors** (Fatores de risco)

```sql
CREATE TABLE clinical_risk_factors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id UUID NOT NULL,
  diabetes ENUM('Sim', 'Não'),
  diabetes_control ENUM('Sem controle', 'Dieta', 'Oral', 'Insulina', 'Subcutânea'),
  dialysis ENUM('Sim', 'Não'),
  covid19 ENUM('Negativa', 'Leve', 'Moderada', 'Severa'),
  covid19_date DATE,
  covid19_vaccine_status ENUM('Completa', 'Incompleta'),
  hypertension ENUM('Sim', 'Não'),
  endocarditis ENUM('Sim', 'Não'),
  endocarditis_type ENUM('Ativa', 'Tratada'),
  copd ENUM('Sim', 'Não'),
  copd_severity ENUM('Leve', 'Moderada', 'Severa'),
  liver_disease ENUM('Sim', 'Não'),
  child_pugh_class ENUM('A', 'B', 'C'),
  mediastinal_radiotherapy ENUM('Sim', 'Não'),
  cancer_5years ENUM('Sim', 'Não'),
  cancer_status ENUM('Remissão', 'Tratamento ativo'),
  extracardiac_arterial_disease VARCHAR(255),
  mobility ENUM('Normal', 'Musculoskeletal', 'Neurological'),
  created_at TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  PRIMARY KEY (id),
  UNIQUE KEY unique_patient (patient_id)
);
```

#### 4. **lab_tests** (Exames laboratoriais)

```sql
CREATE TABLE lab_tests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id UUID NOT NULL,
  test_date DATE,
  hemoglobin_mg FLOAT CHECK (hemoglobin_mg BETWEEN 1 AND 50),
  hematocrit_pct FLOAT CHECK (hematocrit_pct BETWEEN 1 AND 99.99),
  leukocytes_mm3 INT CHECK (leukocytes_mm3 BETWEEN 1000 AND 99000),
  platelets_mm3 INT,
  creatinine_mg FLOAT CHECK (creatinine_mg BETWEEN 0.1 AND 30),
  glucose_mg INT,
  a1c_pct FLOAT CHECK (a1c_pct BETWEEN 1 AND 20),
  created_at TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  INDEX idx_patient_date (patient_id, test_date)
);
```

#### 5. **echocardiography** (Ecocardiogramas)

```sql
CREATE TABLE echocardiography (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id UUID NOT NULL,
  echo_date DATE,
  ejection_fraction_pct INT CHECK (ejection_fraction_pct BETWEEN 1 AND 99),
  spap_pct INT,
  valve_disease ENUM('Aórtica', 'Mitral', 'Tricúspide', 'Pulmonar'),
  -- Estenose
  aortic_stenosis ENUM('Leve', 'Moderado', 'Severo', 'Não doc'),
  mitral_stenosis ENUM('Leve', 'Moderado', 'Severo', 'Não doc'),
  tricuspid_stenosis ENUM('Leve', 'Moderado', 'Severo', 'Não doc'),
  pulmonary_stenosis ENUM('Leve', 'Moderado', 'Severo', 'Não doc'),
  -- Insuficiência
  aortic_insufficiency ENUM('Leve', 'Moderado', 'Severo', 'Não doc'),
  mitral_insufficiency ENUM('Leve', 'Moderado', 'Severo', 'Não doc'),
  tricuspid_insufficiency ENUM('Leve', 'Moderado', 'Severo', 'Não doc'),
  pulmonary_insufficiency ENUM('Leve', 'Moderado', 'Severo', 'Não doc'),
  created_at TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  INDEX idx_patient_date (patient_id, echo_date)
);
```

#### 6. **surgical_procedures** (Procedimentos cirúrgicos)

```sql
CREATE TABLE surgical_procedures (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id UUID NOT NULL,
  surgery_date DATE NOT NULL,
  -- Scores
  sts_score FLOAT,  -- STS score para mortalidade
  sp_score FLOAT,
  frailty_score INT,
  -- Valves
  aortic_valve_replacement BOOLEAN,
  aortic_valve_repair BOOLEAN,
  mitral_valve_replacement BOOLEAN,
  mitral_valve_repair BOOLEAN,
  tricuspid_valve_replacement BOOLEAN,
  tricuspid_valve_repair BOOLEAN,
  pulmonary_valve_replacement BOOLEAN,
  pulmonary_valve_repair BOOLEAN,
  -- Revascularização
  cabg_performed BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  INDEX idx_patient_date (patient_id, surgery_date)
);
```

#### 7. **ecmo_support** (Suporte ECMO)

```sql
CREATE TABLE ecmo_support (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id UUID NOT NULL,
  ecmo_used BOOLEAN,
  intra_aortic_balloon_used BOOLEAN,
  balloon_period ENUM('Pre-OP', 'Intra-OP', 'Post-OP'),
  created_at TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

#### 8. **postoperative_outcomes** (Desfechos pós-OP)

```sql
CREATE TABLE postoperative_outcomes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id UUID NOT NULL,
  extubation_date DATETIME,
  icu_admission_date DATETIME,
  icu_discharge_date DATETIME,
  hospital_discharge_date DATE,
  mortality BOOLEAN DEFAULT FALSE,
  mortality_date DATE,
  mortality_cause ENUM('Cardiac', 'Non-Cardiac'),
  -- Complicações
  wound_infection ENUM('None', 'Superficial', 'Deep', 'Mediastinitis', 'Osteomyelitis'),
  acute_kidney_injury ENUM('KDIGO I', 'KDIGO II', 'KDIGO III'),
  myocardial_infarction BOOLEAN,
  stroke BOOLEAN,
  vasoplegic_shock BOOLEAN,
  reoperation BOOLEAN,
  reoperation_reason VARCHAR(255),
  reoperation_date DATE,
  created_at TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  INDEX idx_patient (patient_id)
);
```

#### 9. **follow_up_30_days** (Seguimento 30 dias)

```sql
CREATE TABLE follow_up_30_days (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id UUID NOT NULL,
  follow_up_type ENUM('Medical visit', 'Phone contact', 'Lost to follow-up', 'Hospitalized'),
  readmission_30d BOOLEAN,
  readmission_date DATE,
  infection_30d BOOLEAN,
  infection_type ENUM('Superficial', 'Deep', 'Mediastinitis', 'Osteomyelitis'),
  mi_30d BOOLEAN,
  stroke_30d BOOLEAN,
  other_event VARCHAR(255),
  created_at TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

#### 10. **audit_logs** (Conformidade LGPD)

```sql
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  hospital_id INT,
  patient_id UUID,
  action VARCHAR(50),  -- CREATE, UPDATE, DELETE, VIEW, DOWNLOAD
  old_values JSON,     -- Valores anteriores (encriptados)
  new_values JSON,     -- Valores novos (encriptados)
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  INDEX idx_patient_audit (patient_id),
  INDEX idx_user_audit (user_id),
  INDEX idx_timestamp (created_at)
);
```

---

## 🔐 Segurança e LGPD {#lgpd}

### Princípios de Conformidade

1. **Consentimento (TCLE)**
   - Campo `consent_sign` = TRUE obrigatório
   - Mantém histórico de consentimento
   - Aceite antes do upload de dados

2. **Criptografia**
   - Dados sensíveis: Nome, CPF, Telefone (criptografia em repouso)
   - HTTPS em trânsito (obrigatório)
   - Chaves armazenadas em `.env` (nunca em Git)

3. **Isolamento de Dados**
   - Cada centro vê APENAS seus pacientes
   - Query padrão: `WHERE hospital_id = $user->hospital_id`
   - Admin pode ver global (com auditoria)

4. **Rastreamento (Audit Log)**
   - TODA ação registrada em `audit_logs`
   - Quem? Quando? Quê? IP?
   - Retenção: 5 anos (conforme LGPD)

5. **Retenção de Dados**
   - Dados de pesquisa: 5 anos pós-cirurgia
   - Anonimização: Remover identificadores após pesquisa
   - Direito ao esquecimento: Script de deletar data de paciente

6. **Autenticação**
   - 2FA obrigatório (já implementado)
   - Senhas: Bcrypt com salt
   - Logout automático após 30 minutos inatividade

### Checklist de Segurança

- [ ] Todas as queries usam parameterized statements (ORM)
- [ ] Nenhuma senha em logs
- [ ] Hash de senhas com Bcrypt
- [ ] CSRF tokens em formulários
- [ ] Rate limiting em login (5 tentativas/15min)
- [ ] Headers de segurança (X-Frame-Options, CSP, etc)
- [ ] Validação server-side TODA entrada
- [ ] Senhas fracas rejeitadas (min 12 chars, complexidade)

---

## Sistema de Upload de Dados {#upload}

### Fluxo de Upload

```
1. Centro acessa: projetobrascore.com.br/upload
2. Autenticação 2FA
3. Download do TEMPLATE (Excel)
   ├── Headers predefinidos
   ├── Validações (ex: age 0-120)
   └── Exemplos de preenchimento
4. Centro preenche planilha
5. Upload de arquivo
6. VALIDAÇÃO (Backend):
   ├── Verificar headers
   ├── Testar tipos de dados
   ├── Checar valores permitidos
   ├── Validar lógica (ex: BMI = peso/(altura²))
   └── Relatório de ERROS (quais linhas/campos)
7. Se OK → Importar para DB
   Se erros → Devolver relatório + permitir re-upload
8. Confirmação: X linhas importadas
```

### Formato Esperado (Template Excel)

```
Coluna A: patient_id (ou deixar vazio para gerar UUID)
Coluna B: med_record (obrigatório, único por hospital)
Coluna C: name
Coluna D: age
Coluna E: gender (M/F)
...
(As 147 variáveis em colunas)
```

### Validações Automáticas

| Campo | Regra | Ação se falhar |
|-------|-------|---|
| `age` | 0-120 | Erro |
| `weight_kg` | 20-300 | Erro |
| `height_cm` | 100-250 | Erro |
| `gender` | M ou F | Erro |
| `admission_date` | Data válida | Erro |
| `med_record` | Único por hospital | Erro |
| `cpf` | CPF válido (se preenchido) | Warning |
| `ejection_fraction` | 1-99 | Erro |

---

## API REST (Roadmap) {#api}

### Endpoints Planejados

#### **Auth**
- `POST /api/auth/login` → JWT token
- `POST /api/auth/logout`
- `POST /api/auth/refresh-token`

#### **Patients (CRUD)**
- `GET /api/patients` → Listar (filtrado por hospital)
- `GET /api/patients/{id}` → Detalhe
- `POST /api/patients` → Criar (validate + audit)
- `PUT /api/patients/{id}` → Atualizar
- `DELETE /api/patients/{id}` → Deletar (soft delete + audit)

#### **Analytics**
- `GET /api/analytics/summary` → Dashboard data
- `GET /api/analytics/risk-scores` → Escores de risco
- `GET /api/analytics/outcomes` → Desfechos por período
- `GET /api/reports/pdf` → Gerar PDF

#### **Upload**
- `POST /api/upload/template` → Download template
- `POST /api/upload/validate` → Validar planilha (sem importar)
- `POST /api/upload/import` → Importar dados

#### **Admin Only**
- `GET /api/admin/hospitals` → Listar centros
- `GET /api/admin/audit-logs` → Rastreamento
- `POST /api/admin/users` → Criar usuário

---

## Dashboards e Análises {#dashboards}

### Dashboard 1: Visão por Centro

Cada hospital vê:
- Total de pacientes (último mês, últimos 90 dias, total)
- Distribuição por idade/gênero
- Fatores de risco mais comuns
- Taxas de mortalidade pós-OP
- Complicações (infecção, AKI, MI, stroke)
- Tempo de internação (UTI e total)
- Procedimentos mais realizados (CABG, valvas)

### Dashboard 2: Análise de Escore de Risco

- Gráfico: Escore predito vs observado
- Tabela: Pacientes por faixa de risco (baixo/médio/alto)
- Validação: Calibração (Hosmer-Lemeshow)
- Discriminação: Curva ROC

### Dashboard 3: Análise Global (Admin)

- Comparação entre centros (geograficamente)
- Densidade de casos por região
- Outliers: Centros com mortalidade elevada
- Tendências temporais

### Relatório Executivo (PDF)

- Resumo executivo (2 páginas)
- Gráficos principais
- Tabelas de desfechos
- Recomendações


## Estrutura de Pastas

```
brascore/
├── README.md (guia rápido)
├── DOCUMENTACAO/
│   ├── CODEBOOK.md (este arquivo)
│   ├── ARQUITETURA.md
│   ├── LGPD_PRIVACIDADE.md
│   ├── GUIA_UPLOAD.md
│   ├── API_SPECS.md
│   └── DIAGRAMA_BD.sql
├── DATABASE/
│   ├── schema.sql (estrutura)
│   ├── migrations/ (Laravel)
│   └── seeds/ (dados iniciais)
├── BACKEND/
│   ├── laravel/ (projeto Laravel)
│   ├── python/ (scripts de cálculo)
│   └── tests/
├── FRONTEND/
│   ├── github-pages/ (projetobrascore.com.br)
│   └── components/
├── CONTRATOS/
│   ├── Patrocinio_1.pdf
│   └── Patrocinio_2.pdf
├── TEMPLATES/
│   └── Upload_Template_BraSCORE.xlsx
└── ANALISES/
    ├── Queries_Python/
    └── Dashboards/
```

---

## 📞 Contatos e Suporte

| Papel | Contato |
|------|---------|
| **Coordenador Geral** | biancamaglia@alumni.usp.br |

---

**Versão 1.0 | Maio/2026 | Todos direitos reservados**

