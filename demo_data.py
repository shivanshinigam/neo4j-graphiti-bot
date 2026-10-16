"""
demo_data.py — Pre-generated interconnected sample data per industry sector.

Each sector has:
  - FACTS: A list of interconnected text facts to ingest into the Knowledge Graph
  - QUESTIONS: Suggested demo questions that show off relational + semantic accuracy
  - DESCRIPTION: One-line summary shown in the UI dropdown

The facts are intentionally interconnected — e.g., a person links to a company,
which links to a product, which links to an event — so that graph traversal
(not just keyword search) is needed to answer the demo questions correctly.
"""

DEMO_SECTORS = {

    "Finance & Banking": {
        "description": "Capital markets, banking, investment — CAR, bonds, portfolios",
        "facts": [
            "JPMorgan Chase is a global investment bank headquartered in New York.",
            "Jamie Dimon is the Chief Executive Officer of JPMorgan Chase.",
            "JPMorgan Chase reported a Capital Adequacy Ratio (CAR) of 14.2% in Q3 2024.",
            "JPMorgan Chase manages a bond portfolio worth $680 billion including US Treasury Bonds.",
            "BlackRock is the world's largest asset management firm with $10 trillion in AUM.",
            "Larry Fink is the Chief Executive Officer of BlackRock.",
            "BlackRock's flagship product is the iShares S&P 500 ETF with $400 billion in assets.",
            "Goldman Sachs is a leading global investment banking and securities firm.",
            "David Solomon is the Chief Executive Officer of Goldman Sachs.",
            "Goldman Sachs reported a Capital Adequacy Ratio (CAR) of 15.1% in Q3 2024.",
            "The US Federal Reserve raised interest rates by 25 basis points in September 2024.",
            "The Fed rate hike in September 2024 impacted bond valuations across JPMorgan and Goldman Sachs portfolios.",
            "JPMorgan Chase acquired First Republic Bank in May 2023 for $10.6 billion.",
            "BlackRock partnered with Goldman Sachs in October 2024 to co-manage a $50 billion infrastructure fund.",
            "US Treasury Bonds are classified as Tier 1 capital assets under Basel III regulations.",
        ],
        "questions": [
            "Who is the CEO of JPMorgan Chase?",
            "What is Goldman Sachs's Capital Adequacy Ratio?",
            "Which company did JPMorgan acquire in 2023?",
            "How did the Fed rate hike affect JPMorgan and Goldman Sachs?",
            "What is BlackRock's flagship product and how much does it manage?",
            "Which two firms partnered to manage the infrastructure fund?",
        ]
    },

    "Healthcare & Pharma": {
        "description": "Hospitals, clinical trials, FDA approvals, drug pipelines",
        "facts": [
            "Pfizer is a global pharmaceutical company headquartered in New York.",
            "Albert Bourla is the Chief Executive Officer of Pfizer.",
            "Pfizer's Paxlovid is an oral antiviral treatment approved by the FDA for COVID-19 in 2021.",
            "Pfizer and BioNTech co-developed the Comirnaty COVID-19 mRNA vaccine.",
            "Apollo Hospitals is India's largest private hospital chain with 71 hospitals.",
            "Dr. Prathap C Reddy is the founder and Chairman of Apollo Hospitals.",
            "Apollo Hospitals launched an AI-powered diagnostic platform called Apollo AskApollo in 2024.",
            "Johnson & Johnson is a diversified healthcare company with products in pharma, medical devices, and consumer health.",
            "Joaquin Duato is the Chief Executive Officer of Johnson & Johnson.",
            "Johnson & Johnson's drug Darzalex is used for treatment of multiple myeloma and generated $9.7 billion in revenue in 2023.",
            "Apollo Hospitals partnered with Pfizer in 2024 to distribute Paxlovid across 40 Indian cities.",
            "The FDA approved Johnson & Johnson's Tremfya for treatment of Crohn's disease in October 2024.",
            "Pfizer invested $3.3 billion in oncology research in 2024 targeting lung and breast cancer.",
            "Apollo Hospitals reported 99.2% diagnostic accuracy using their AI diagnostic platform.",
            "Clinical Trial Phase 3 for Pfizer's new RSV vaccine started in September 2024 with 20,000 participants.",
        ],
        "questions": [
            "Who is the CEO of Pfizer?",
            "What did Pfizer and Apollo Hospitals partner for?",
            "Which drug does Johnson & Johnson sell for multiple myeloma?",
            "What FDA approval did Johnson & Johnson receive in October 2024?",
            "What AI platform did Apollo Hospitals launch?",
            "How much did Pfizer invest in oncology research in 2024?",
        ]
    },

    "Retail & E-Commerce": {
        "description": "Supply chains, sales data, inventory, consumer brands",
        "facts": [
            "Walmart is the world's largest retailer with $648 billion in annual revenue.",
            "Doug McMillon is the Chief Executive Officer of Walmart.",
            "Walmart operates 10,500 stores across 24 countries.",
            "Amazon is the world's largest e-commerce platform with $575 billion in annual revenue.",
            "Andy Jassy is the Chief Executive Officer of Amazon.",
            "Amazon's Prime membership has 200 million subscribers globally as of 2024.",
            "Reliance Retail is India's largest retailer owned by Reliance Industries.",
            "Isha Ambani is the Executive Director of Reliance Retail.",
            "Reliance Retail acquired the franchise rights for 7-Eleven convenience stores in India in 2023.",
            "Walmart acquired a 77% stake in Flipkart for $16 billion in 2018.",
            "Flipkart is India's second-largest e-commerce platform after Amazon.",
            "Amazon launched Same-Day Delivery in 50 Indian cities in partnership with Reliance Logistics in 2024.",
            "Walmart's Black Friday 2023 sale generated $9.8 billion in revenue in a single day.",
            "Amazon's top-selling category in India is Electronics followed by Fashion.",
            "Reliance Retail's JioMart platform crossed 5 million daily active users in 2024.",
        ],
        "questions": [
            "Who is the CEO of Walmart?",
            "What stake does Walmart hold in Flipkart?",
            "Who is the Executive Director of Reliance Retail?",
            "What did Amazon and Reliance partner for in 2024?",
            "How many subscribers does Amazon Prime have?",
            "What was Walmart's Black Friday 2023 revenue?",
        ]
    },

    "Logistics & Supply Chain": {
        "description": "Shipping, freight, warehousing, last-mile delivery",
        "facts": [
            "DHL is the world's largest logistics company operating in 220 countries.",
            "Tobias Meyer is the Chief Executive Officer of DHL Group.",
            "DHL's StreetScooter is an electric delivery van fleet with 10,000 vehicles in Europe.",
            "FedEx is a global courier and logistics company headquartered in Memphis, Tennessee.",
            "Raj Subramaniam is the President and Chief Executive Officer of FedEx.",
            "FedEx operates the world's largest cargo airline fleet with 700 aircraft.",
            "Maersk is the world's largest container shipping company by fleet size.",
            "Vincent Clerc is the Chief Executive Officer of Maersk.",
            "Maersk operates 738 container vessels with a capacity of 4.3 million TEUs.",
            "DHL partnered with Maersk in 2024 to offer integrated sea-air freight solutions for Asia-Europe corridors.",
            "FedEx launched its AI-powered route optimization platform FedEx Surround in 2024.",
            "The Suez Canal blockage in March 2021 caused a $9.6 billion per day disruption affecting Maersk and DHL shipments.",
            "Maersk acquired Pilot Freight Services in 2022 to expand US last-mile delivery capabilities.",
            "DHL and FedEx both reported 15% revenue growth in Q2 2024 driven by e-commerce demand.",
            "Cold chain logistics for pharmaceutical shipments is handled by DHL Life Sciences division.",
        ],
        "questions": [
            "Who is the CEO of DHL?",
            "What did DHL and Maersk partner for in 2024?",
            "Which company operates the largest cargo airline fleet?",
            "How did the Suez Canal blockage impact Maersk and DHL?",
            "What AI platform did FedEx launch?",
            "Which DHL division handles pharmaceutical cold chain?",
        ]
    }
}


def get_sector_names() -> list:
    """Returns list of sector names for the frontend dropdown."""
    return list(DEMO_SECTORS.keys())


def get_sector_facts(sector: str) -> list:
    """Returns list of facts to ingest for a given sector."""
    return DEMO_SECTORS.get(sector, {}).get("facts", [])


def get_sector_questions(sector: str) -> list:
    """Returns list of suggested demo questions for a given sector."""
    return DEMO_SECTORS.get(sector, {}).get("questions", [])


def get_sector_description(sector: str) -> str:
    """Returns the one-line description for a sector."""
    return DEMO_SECTORS.get(sector, {}).get("description", "")
