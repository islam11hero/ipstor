# Project: Proxy Reselling Platform (Like IPRoyal)
# Tech Stack: Next.js 14 (App Router), Tailwind CSS, Shadcn UI, Supabase.

## Business Model (Semi-Automated MVP)
We are building a proxy reselling platform on a $0 budget. 
Users will register, top up their balance (manually via Crypto), and order proxies. 
The Admin will manually fulfill the orders by pasting the proxy IPs into the user's dashboard.

## Phases
1. Landing Page: Dark-mode modern UI explaining Datacenter/Residential proxies.
2. Auth & DB: Supabase (Login/Register, User profiles, Orders, Proxies tables).
3. User Dashboard: Check balance, Add balance request, Buy Proxies form, View purchased proxies.
4. Admin Panel: Secret route to approve balance requests and manually assign proxy details (IP:Port:User:Pass).