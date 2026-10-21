"""
demo_data.py — Pre-generated interconnected sample data per industry sector.

Each sector has:
  - FACTS: A list of interconnected text facts to ingest into the Knowledge Graph
  - QUESTIONS: Suggested demo questions that show off relational + semantic accuracy
  - DESCRIPTION: One-line summary shown in the UI dropdown

Police & Defence use case:
  - Entity resolution across FIRs (one person = multiple aliases)
  - Gang network mapping, money laundering trail
  - Cross-case linking (arms trafficking → murder → hawala → drugs → extortion)
"""

DEMO_SECTORS = {

    "Police & Defence Intelligence": {
        "description": "Criminal network mapping, FIR cross-linking, money trail & identity resolution",
        "facts": [

            # Core criminal: Rajan Mehta (multiple aliases across datasets)
            "Rajan Mehta, also known as 'Raju Bhai', is the alleged kingpin of the Mumbai-based Mehta Crime Syndicate.",
            "Rajan Mehta was charged under FIR #2018-MUM-0041 for operating an illegal arms trafficking network from Dharavi, Mumbai in October 2018.",
            "In FIR #2018-MUM-0041, Rajan Mehta supplied 47 unlicensed firearms to the Navi Mumbai underworld between January and September 2018.",
            "Rajan Mehta was arrested by Mumbai Crime Branch in November 2018 but released on bail in February 2019 after witness Suresh Nair retracted his statement.",
            "Rajan Mehta uses the alias 'Raj Kumar' in all financial transactions to conceal his identity from law enforcement.",
            "Under alias 'Raj Kumar', Rajan Mehta incorporated three shell companies: RK Exports Pvt Ltd, Starline Logistics, and NovaTrade Solutions, all registered in Surat, Gujarat in 2019.",
            "RK Exports Pvt Ltd (owner: Raj Kumar, real identity: Rajan Mehta) received Rs 14.2 crore in wire transfers from UAE-based Al-Haroon General Trading between April and December 2020.",
            "Al-Haroon General Trading in Dubai is controlled by Farooq Al-Rashidi, a known money laundering facilitator under Interpol investigation since 2017.",
            "Farooq Al-Rashidi runs a global Hawala network that funnels Gulf money into India through fake import-export invoices.",
            "The Hawala network of Farooq Al-Rashidi also funded the 2021 Bengaluru bomb blast, as per the NIA chargesheet filed in 2022.",

            # Second criminal: Leela Devi (money mule/financier)
            "Leela Devi, 42, from Pune, was named in FIR #2020-PUN-0117 for knowingly allowing her bank accounts to be used as conduits for laundered money.",
            "Leela Devi's accounts at Bank of Maharashtra and HDFC Bank received Rs 8.7 crore between 2019 and 2021 from shell company Starline Logistics controlled by Rajan Mehta.",
            "Leela Devi is the sister-in-law of Prakash Devi, a Pune Police constable under departmental inquiry for leaking raid information to criminals.",
            "Constable Prakash Devi is alleged to have tipped off Rajan Mehta about a CBI raid scheduled on Starline Logistics in March 2020, allowing Mehta to destroy evidence.",

            # Third criminal: Vikas Tiwari (hitman/enforcer)
            "Vikas Tiwari, known as 'Vicky Bhai', is a hitman and enforcer for Rajan Mehta's syndicate.",
            "Vikas Tiwari is charged in FIR #2019-DEL-0089 for the murder of Anil Kapoor, a rival drug dealer in Delhi's Paharganj area in July 2019.",
            "FIR #2019-DEL-0089 notes that Vikas Tiwari used a .32-calibre pistol — the same model found in the Dharavi arms cache linked to Rajan Mehta in FIR #2018-MUM-0041.",
            "Vikas Tiwari is absconding since August 2019 and believed to be hiding near the Raxaul-Nepal border per Intelligence Bureau reports.",
            "Vikas Tiwari's mobile records (IMEI 356723099012345) show 37 calls with Rajan Mehta in the 72 hours before the Paharganj murder.",
            "Vikas Tiwari was previously arrested in 2015 under FIR #2015-MUM-0203 for extortion of a Dharavi textile merchant but acquitted due to lack of evidence.",

            # Drug trafficking link
            "NovaTrade Solutions (Rajan Mehta's shell company) imported chemicals from China diverted for methamphetamine production, per NCB Case #NCB-2022-0044.",
            "NCB Case #NCB-2022-0044 identified a drug lab in Vapi, Gujarat run by Suresh Patel who reports directly to Rajan Mehta.",
            "Suresh Patel was arrested in Vapi in January 2023 with 18 kg of methamphetamine and confessed that 'Raju Bhai' (Rajan Mehta) is his supplier.",
            "Drug money from Suresh Patel's Vapi operation was deposited into Leela Devi's bank accounts in cash deposits of Rs 49,000 per transaction to avoid KYC flagging.",

            # Gang network and assets
            "The Mehta Crime Syndicate controls illegal gambling dens in Mumbai's Ghatkopar, Kurla, and Dharavi generating an estimated Rs 2 crore per month.",
            "The syndicate operates an illegal betting app called 'Lucky Star' hosted on servers in Macau.",
            "Lucky Star app was found on 14 phones seized during Dharavi police raid in May 2022 (Raid Report #MUM-RAID-2022-0077).",
            "Rajan Mehta owns a Lonavala property worth Rs 3.8 crore registered under his wife Anita Mehta's name to evade income tax.",
            "Anita Mehta (wife of Rajan Mehta) owns properties worth Rs 9.1 crore across Mumbai, Lonavala, and Dubai despite having no declared income.",

            # International links / Interpol
            "Interpol Red Notice #A-1234/2022 was issued against Rajan Mehta in 2022 for transnational money laundering and arms trafficking.",
            "Rajan Mehta holds a fraudulent passport under the name 'Rohan Malhotra' obtained through a corrupt contact in the Andheri Passport Office.",
            "Using the passport of 'Rohan Malhotra', Rajan Mehta met Farooq Al-Rashidi at the Grand Hyatt Hotel in Dubai in November 2021, confirmed by hotel records obtained by RAW.",

            # Political nexus
            "MLA Deshmukh from Nashik is alleged to have received Rs 1.5 crore in cash from the Mehta Syndicate for ensuring police officer transfers that weakened investigation teams.",
            "MLA Deshmukh's aide Satish Gore was caught on a wiretap in March 2021 discussing police transfers and protection arrangements with an unidentified Mehta Syndicate member.",

            # Victims and witnesses
            "Witness Suresh Nair who retracted testimony in FIR #2018-MUM-0041 later told a magistrate he received Rs 25 lakh and death threats to change his statement.",
            "Anil Kapoor (victim in FIR #2019-DEL-0089) was a rival drug dealer attempting to expand from Delhi into Mumbai, directly threatening the Mehta syndicate's territory.",
            "Journalist Ramesh Sharma from The Mumbai Mirror was investigating Rajan Mehta's financial network and received death threats in August 2022; his exposé was published posthumously.",
        ],
        "questions": [
            "What are all crimes Rajan Mehta is linked to across all FIRs?",
            "How is Leela Devi connected to Rajan Mehta's money laundering network?",
            "Trace the complete money trail from Dubai to India in this case",
            "Who are all known associates and aliases of Rajan Mehta?",
            "What is the connection between the 2018 arms case and the 2019 Delhi murder?",
            "How is Farooq Al-Rashidi connected to the Bengaluru bomb blast?",
            "Which shell companies were used for laundering and who owns them?",
            "What properties does Rajan Mehta control through family members?",
        ]
    }
}


def get_sector_names() -> list:
    return list(DEMO_SECTORS.keys())


def get_sector_facts(sector: str) -> list:
    return DEMO_SECTORS.get(sector, {}).get("facts", [])


def get_sector_questions(sector: str) -> list:
    return DEMO_SECTORS.get(sector, {}).get("questions", [])


def get_sector_description(sector: str) -> str:
    return DEMO_SECTORS.get(sector, {}).get("description", "")
