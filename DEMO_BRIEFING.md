# 🔍 Demo Briefing: Police & Defence Intelligence Dataset

> Use this as your **talking guide** before clicking anything. Explain the dataset structure to officials, then let the graph answer their questions live.

---

## What This Dataset Simulates

This is a **fictional but realistic** Indian crime investigation dataset built to demonstrate how a Knowledge Graph can connect fragmented records across different police databases, FIRs, financial records, and intelligence reports — **exactly like real law enforcement would need**.

> [!IMPORTANT]
> All names, FIR numbers, and facts are **fictional and synthetic** — created for demonstration purposes only. No real individuals or cases are referenced.

---

## The Core Criminal Network

```
RAJAN MEHTA  ←── THE KINGPIN
   │
   ├── Alias: "Raju Bhai"       ← street name, used in FIRs
   ├── Alias: "Raj Kumar"       ← used for all financial/company registrations
   ├── Alias: "Rohan Malhotra"  ← fraudulent passport, used for international travel
   │
   ├── VIKAS TIWARI "Vicky Bhai" ← enforcer/hitman, reports to Rajan
   ├── LEELA DEVI               ← money mule / financier (Pune)
   ├── SURESH PATEL             ← drug lab operator (Vapi, Gujarat)
   ├── FAROOQ AL-RASHIDI        ← Hawala banker (Dubai, UAE)
   ├── CONSTABLE PRAKASH DEVI   ← corrupt police insider (Pune)
   └── MLA DESHMUKH             ← political nexus (Nashik)
```

---

## Cases & FIRs in the Dataset

| Case / FIR | Year | City | Charge | Key Accused |
|---|---|---|---|---|
| FIR #2018-MUM-0041 | 2018 | Mumbai (Dharavi) | Illegal arms trafficking — 47 firearms | Rajan Mehta |
| FIR #2019-DEL-0089 | 2019 | Delhi (Paharganj) | Murder of rival drug dealer | Vikas Tiwari |
| FIR #2020-PUN-0117 | 2020 | Pune | Money laundering via bank accounts | Leela Devi |
| FIR #2015-MUM-0203 | 2015 | Mumbai | Extortion (acquitted) | Vikas Tiwari |
| NCB Case #NCB-2022-0044 | 2022 | Vapi, Gujarat | Drug manufacturing — 18 kg meth | Suresh Patel |
| Interpol Red Notice #A-1234/2022 | 2022 | International | Transnational money laundering & arms | Rajan Mehta |

---

## Shell Companies Used for Money Laundering

| Company | Registered | Beneficial Owner | Purpose |
|---|---|---|---|
| RK Exports Pvt Ltd | Surat, Gujarat | "Raj Kumar" = Rajan Mehta | Received ₹14.2 Cr from Dubai |
| Starline Logistics | Surat, Gujarat | "Raj Kumar" = Rajan Mehta | Funnelled ₹8.7 Cr to Leela Devi |
| NovaTrade Solutions | Surat, Gujarat | "Raj Kumar" = Rajan Mehta | Imported chemicals for drug lab |

---

## The Money Trail (Follow the Money)

```
DUBAI
  Farooq Al-Rashidi (Hawala banker)
    └── Al-Haroon General Trading (UAE company)
          └── Wire transfers: ₹14.2 Cr
                └── RK Exports Pvt Ltd (shell, Surat)
                      └── Starline Logistics (shell, Surat)
                            └── Leela Devi's bank accounts (Pune)
                                  └── Cash deposits ₹49,000 × many = drug money
                                        └── Suresh Patel's drug lab (Vapi)
```

---

## Key Cross-Case Connections the Graph Can Reveal

| Connection | Why it matters |
|---|---|
| Same `.32 pistol` model in arms FIR (2018) and murder FIR (2019) | Links Rajan Mehta to Vikas Tiwari's murder weapon |
| "Raj Kumar" = Rajan Mehta = "Raju Bhai" | All three aliases resolve to one criminal across 5 cases |
| Hawala network → Bengaluru bomb blast | Financial link from a crime syndicate to a terror event |
| Leela Devi ← Constable Prakash Devi | Insider police leak that destroyed evidence |
| Dubai hotel records → fraudulent passport | RAW intelligence + Passport Office corruption |

---

## What You Can Ask the System (Sample Queries)

### 🔴 Identity Resolution
- *"Who is Raju Bhai?"*
- *"What are all aliases of Rajan Mehta?"*
- *"Is Raj Kumar the same person as Rajan Mehta?"*

### 🔴 Case Cross-Linking
- *"What cases is Rajan Mehta linked to across all FIRs?"*
- *"What is the connection between the 2018 arms case and the 2019 Delhi murder?"*
- *"Has Vikas Tiwari been previously arrested?"*

### 💰 Money Trail
- *"Trace the complete money trail from Dubai to India"*
- *"Which shell companies were used for laundering and who owns them?"*
- *"How did drug money reach Leela Devi's bank accounts?"*

### 🕸️ Network Mapping
- *"Who are all known associates of Rajan Mehta?"*
- *"How is Farooq Al-Rashidi connected to the Bengaluru blast?"*
- *"Who is the corrupt police insider in this network?"*

### 🏠 Asset Investigation
- *"What properties does Rajan Mehta control through family members?"*
- *"What does Anita Mehta own and what is her declared income?"*

---

## What Makes This Different from a Normal Search

> [!TIP]
> **Normal keyword search** on "Rajan Mehta" → finds only records with that exact name.
>
> **Knowledge Graph** on "Rajan Mehta" → finds ALL records for "Raju Bhai", "Raj Kumar", "Rohan Malhotra", connects to Dubai Hawala, Bengaluru blast, drug lab, murder case, shell companies, corrupt cop — **automatically**.

This is the value for law enforcement:
- One officer enters a suspect's name
- The graph traverses all linked databases
- Returns the **full criminal picture** — even across cases where different aliases were used

---

## Demo Flow (Suggested Order)

1. **Load the dataset** → click "Load Demo Data"
2. **Show identity resolution** → ask *"What are all aliases of Rajan Mehta?"*
3. **Show cross-case linking** → ask *"What is the connection between the 2018 arms case and the 2019 Delhi murder?"*
4. **Show money trail** → ask *"Trace the complete money trail from Dubai to India"*
5. **Show network map** → ask *"Who are all known associates of Rajan Mehta?"*
6. **Upload your own FIR** → show how new data immediately becomes queryable
