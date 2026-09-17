Sim. Fechando o contrato de **Matching v1** com as fórmulas que propus, eu deixaria assim:

## 1. Competências — 60%

Cada competência do Projeto tem um nível de domínio de **1 a 5**.

Normalização:

$$
levelNorm = \frac{level}{5}
$$

A Opportunity possui competências com peso de **1 a 5**.

Para cada competência exigida pela Opportunity:

$$
component_i = levelNorm_i \times \frac{weight_i}{5}
$$

Mas, para evitar que o peso seja aplicado duas vezes, a fórmula final mais limpa é:

$$
competenceScore =
\frac{
\sum_{i=1}^{n}(weight_i \times levelNorm_i)
}{
\sum_{i=1}^{n}weight_i
}
$$

Onde:

* `weight_i` = peso da competência na Opportunity, de 1 a 5
* `levelNorm_i` = nível do Projeto / 5
* resultado = `0..1`

### Exemplo

Opportunity:

| Competência      | Peso |
| ---------------- | ---: |
| Machine Learning |    5 |
| Python           |    3 |
| Computer Vision  |    2 |

Projeto:

| Competência      | Nível |
| ---------------- | ----: |
| Machine Learning |     4 |
| Python           |     5 |
| Computer Vision  |     3 |

Então:

```text
ML       = 4/5 = 0.80
Python   = 5/5 = 1.00
CV       = 3/5 = 0.60

competenceScore =
(5×0.80 + 3×1.00 + 2×0.60)
/
(5+3+2)

= 8.8 / 10
= 0.88
```

**Competence Score = 88%**

---

# 2. TRL — 20%

TRL vai de **1 a 9**.

Aqui queremos medir proximidade entre o TRL atual do Projeto e o TRL desejado pela Opportunity.

A ideia é que:

* projeto no TRL desejado → `1.0`
* projeto abaixo do desejado → recebe pontuação proporcional
* projeto acima do desejado → também recebe `1.0`, porque já superou o estágio solicitado

Fórmula:

$$
trlScore =
\min\left(\frac{projectTRL}{desiredTRL},1\right)
$$

### Exemplo

Opportunity deseja TRL 7.

Projeto está no TRL 5:

$$
trlScore = \frac{5}{7}=0.7143
$$

**TRL Score = 71,43%**

Projeto no TRL 7:

$$
7/7=1
$$

**100%**

Projeto no TRL 9:

$$
9/7 > 1
$$

limitamos para:

**100%**

### Porém, há uma decisão importante

A Opportunity atual possui `minTrl`, não necessariamente um `desiredTrl`.

Então, no código, eu usaria:

```text
project.trl >= opportunity.minTrl
    → trlScore = 1
```

Se estiver abaixo:

```text
trlScore = project.trl / opportunity.minTrl
```

Ou seja:

$$
trlScore =
\begin{cases}
1 & \text{se } projectTRL \ge minTRL \\
\frac{projectTRL}{minTRL} & \text{se } projectTRL < minTRL
\end{cases}
$$

Isso combina melhor com o significado atual de `minTrl`.

---

# 3. CRL — 20%

Mesma lógica do TRL.

Como o CRL representa maturidade/readiness comercial, usamos a mesma estrutura:

$$
crlScore =
\begin{cases}
1 & \text{se } projectCRL \ge desiredCRL \\
\frac{projectCRL}{desiredCRL} & \text{se } projectCRL < desiredCRL
\end{cases}
$$

Se a Opportunity exigir CRL 6 e o Projeto tiver CRL 4:

$$
crlScore = 4/6 = 0.6667
$$

**CRL Score = 66,67%**

---

# 4. Score final

Os pesos definidos no contrato:

```text
Competências = 60%
TRL          = 20%
CRL          = 20%
```

Então:

$$
finalScore =
(competenceScore \times 0.60)
+
(trlScore \times 0.20)
+
(crlScore \times 0.20)
$$

E:

$$
matchPercentage = finalScore \times 100
$$

### Exemplo completo

Suponha:

```text
competenceScore = 0.88
trlScore        = 0.7143
crlScore        = 0.6667
```

Então:

$$
finalScore =
(0.88\times0.60)
+
(0.7143\times0.20)
+
(0.6667\times0.20)
$$

$$
finalScore = 0.528 + 0.14286 + 0.13334
$$

$$
finalScore = 0.8042
$$

Resultado:

```text
score:      0.804200
percentage: 80.42%
```

---

# 5. Campos ausentes

Perfeito. Essa regra é mais coerente porque distingue **“a Opportunity não definiu um critério”** de **“o Projeto não atende a um critério definido”**.

Eu alteraria o contrato para ficar assim:

## 5.1. Regra geral

Para cada componente — **Competências, TRL e CRL**:

| Opportunity | Projeto       | Tratamento             |
| ----------- | ------------- | ---------------------- |
| Não exige   | Não informado | Critério não participa |
| Não exige   | Informado     | Critério não participa |
| Exige       | Informado     | Calcula normalmente    |
| Exige       | Não informado | **Score = 0**          |

Ou seja:

> **Ausência na Opportunity = remove o critério e redistribui o peso.**
> **Ausência no Projeto, quando a Opportunity exige = score 0.**

---

## 5.2. Competências

A Opportunity pode não ter nenhuma competência cadastrada.

Nesse caso, os **60% de competência são redistribuídos** entre TRL e CRL que estiverem definidos pela Opportunity.

### Exemplo

Opportunity:

```text
competências = nenhuma
minTRL = 7
minCRL = 6
```

Então:

```text
Competências → removido
TRL          → 50%
CRL          → 50%
```

Se:

```text
TRL Score = 0.80
CRL Score = 1.00
```

temos:

$$
finalScore = (0.80 \times 0.50) + (1.00 \times 0.50)
$$

$$
finalScore = 0.90
$$

**Match = 90%**

---

### Opportunity exige competência, Projeto não possui

Nesse caso:

$$
competenceScore = 0
$$

**Não redistribuímos os 60%.**

Exemplo:

```text
Competência → exigida, mas ausente no Projeto → 0
TRL         → 1.0
CRL         → 1.0
```

Resultado:

$$
finalScore =
(0 \times 0.60)
+
(1.0 \times 0.20)
+
(1.0 \times 0.20)
= 0.40
$$

**Match = 40%**

Isso representa corretamente que o Projeto deixou de atender o principal componente da Opportunity.

---

# 5.3. TRL

A mesma regra.

### Opportunity não informa `minTrl`

O TRL **não participa do cálculo**.

Os 20% são redistribuídos.

### Opportunity informa `minTrl = 7`

E Projeto possui:

```text
trl = 5
```

Então:

$$
trlScore = \frac{5}{7}=0.7143
$$

### Opportunity informa `minTrl = 7`

Mas Projeto:

```text
trl = NULL
```

Então:

$$
trlScore = 0
$$

Os 20% **continuam pertencendo ao TRL**.

---

# 5.4. CRL

Exatamente a mesma lógica.

### Opportunity sem CRL

Remove CRL do cálculo e redistribui os 20%.

### Opportunity exige CRL

Projeto possui CRL:

$$
crlScore =
\min\left(\frac{projectCRL}{requiredCRL},1\right)
$$

### Opportunity exige CRL

Projeto não possui CRL:

$$
crlScore = 0
$$

Sem redistribuição.

---

# 5.5. Fórmula geral

Acho melhor formalizarmos isso de maneira genérica.

Pesos originais:

$$
W_C = 0.60
$$

$$
W_T = 0.20
$$

$$
W_R = 0.20
$$

onde:

* `C` = Competências
* `T` = TRL
* `R` = CRL

Primeiro determinamos quais critérios estão **definidos pela Opportunity**.

### Peso efetivo

Se o critério não é definido pela Opportunity:

$$
effectiveWeight_i = 0
$$

Caso contrário:

$$
effectiveWeight_i =
\frac{originalWeight_i}
{\sum originalWeight_j\;|\;j\text{ definido}}
$$

Assim, os pesos sempre somam 1.

---

# 5.6. Exemplo com todos os critérios

Opportunity:

```text
Competências → sim
minTRL       → 7
minCRL       → 6
```

Pesos:

```text
Competência = 60%
TRL         = 20%
CRL         = 20%
```

Projeto:

```text
Competências → possui
TRL          → 5
CRL          → 4
```

Scores:

```text
competenceScore = 0.80
trlScore        = 5/7 = 0.7143
crlScore        = 4/6 = 0.6667
```

Resultado:

$$
0.80(0.60)+0.7143(0.20)+0.6667(0.20)
$$

$$
=0.48+0.14286+0.13334
$$

$$
=0.7562
$$

**75,62%**

---

# 5.7. Exemplo: Opportunity não exige CRL

```text
Opportunity:
Competências → sim
minTRL       → 7
minCRL       → NULL
```

Peso disponível:

```text
Competências = 60
TRL          = 20
Total        = 80
```

Pesos redistribuídos:

```text
Competências = 60/80 = 75%
TRL          = 20/80 = 25%
```

Projeto:

```text
competenceScore = 0.80
trlScore        = 0.7143
```

Resultado:

$$
0.80(0.75)+0.7143(0.25)
$$

$$
=0.60+0.178575
$$

$$
=0.778575
$$

**77,86%**

---

# 5.8. Exemplo: Opportunity exige CRL, Projeto não informa

```text
Opportunity:
CRL = 6

Projeto:
CRL = NULL
```

Então:

```text
crlScore = 0
```

E os pesos permanecem:

```text
Competências = 60%
TRL          = 20%
CRL          = 20%
```

Isso é diferente de simplesmente remover o CRL.

---

# 5.9. Regra definitiva

Eu colocaria no contrato exatamente esta regra:

> **A ausência de um critério na Opportunity significa que esse critério não é relevante para aquele Match. Seu peso original é removido e redistribuído proporcionalmente entre os critérios definidos.**
>
> **A ausência de um dado no Projeto, quando a Opportunity define esse critério como requisito, representa não atendimento ao requisito e recebe score 0. O peso do critério é preservado.**

Isso também deixa a implementação bastante determinística.

### Pseudocódigo

```ts
const criteria = [
  {
    key: 'competence',
    originalWeight: 0.60,
    required: opportunityHasCompetences,
    score: competenceScore,
  },
  {
    key: 'trl',
    originalWeight: 0.20,
    required: opportunity.minTrl !== null,
    score: trlScore, // 0 se projeto.trl ausente
  },
  {
    key: 'crl',
    originalWeight: 0.20,
    required: opportunity.desiredCrl !== null,
    score: crlScore, // 0 se projeto.crl ausente
  },
];

const totalOriginalWeight = criteria
  .filter((criterion) => criterion.required)
  .reduce((sum, criterion) => sum + criterion.originalWeight, 0);

const finalScore = criteria
  .filter((criterion) => criterion.required)
  .reduce(
    (sum, criterion) =>
      sum +
      criterion.score *
        (criterion.originalWeight / totalOriginalWeight),
    0,
  );
```

A única situação especial é se **a Opportunity não definir nenhum dos três critérios**. Nesse caso não existe base para calcular um Match por esse modelo, então eu trataria como `score = 0`/não elegível, em vez de fabricar um `100%`.

---

# 6. Hard filters

Eu manteria poucos filtros realmente eliminatórios.

### Opportunity

Deve estar:

```text
status = OPEN
```

### Project

Deve estar:

```text
status = PUBLISHED
```

### Patent requirement

Se:

```text
opportunity.patentRequirement = REQUIRED
```

então Projeto com:

```text
project.patentStatus = NONE
```

**não entra no matching.**

Os demais critérios continuam sendo **score**, não filtro.

Ou seja, TRL baixo não elimina o Projeto; ele reduz o score.

---

# 7. Explanation

O campo `explanation` deve guardar os componentes que produziram o resultado.

Eu sugiro este contrato:

```json
{
  "version": "v1",
  "score": 0.8042,
  "percentage": 80.42,
  "components": {
    "competence": {
      "score": 0.88,
      "weight": 0.60
    },
    "trl": {
      "score": 0.7143,
      "weight": 0.20
    },
    "crl": {
      "score": 0.6667,
      "weight": 0.20
    }
  }
}
```

E, para competências, podemos guardar o detalhamento:

```json
{
  "competence": {
    "score": 0.88,
    "weight": 0.60,
    "details": [
      {
        "competenceId": "uuid",
        "projectLevel": 4,
        "opportunityWeight": 5,
        "normalizedLevel": 0.8
      },
      {
        "competenceId": "uuid",
        "projectLevel": 5,
        "opportunityWeight": 3,
        "normalizedLevel": 1.0
      }
    ]
  }
}
```

Isso será muito útil depois para a UI mostrar **por que aquele match recebeu 80,42%**.

---

# 8. Contrato definitivo do Matching v1

Eu fecharia a especificação assim:

```text
MATCH v1

Hard filters
├── Opportunity.status = OPEN
├── Project.status = PUBLISHED
└── PatentRequirement.REQUIRED
    └── Project.patentStatus != NONE

Soft scoring
├── Competências → 60%
├── TRL          → 20%
└── CRL          → 20%

Competência
└── weighted average dos níveis normalizados 0..1

TRL
└── min(projectTRL / opportunityMinTRL, 1)

CRL
└── min(projectCRL / opportunityDesiredCRL, 1)

Final
└── weighted average dos componentes disponíveis

Output
├── score: 0..1
├── percentage: 0..100
└── explanation: componentes + pesos + detalhes

Model
└── v1

Persistência
└── unique(opportunityId, projectId, modelVersion)
```

