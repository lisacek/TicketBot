# TicketBot
TicketBot is a bot that allows users to create tickets in a ticketing system.<br>
Version: 1.0.0

# Requirements
- [Node.js](https://nodejs.org/en/) (v10.16.3)
- [Discord.js](https://discord.js.org/) (v13.x)
- [MySQL](https://www.mysql.com/) 8+

# Test Server
- https://discord.gg/3tRKp3T

# Setup
1. Rename configExample.json to config.json
2. Fill sql details and bot token
3. npm install
4. Start the bot (node .)
5. /panel send - Sends ticket panel
6. /panel ticket-category type: <TICKET_TYPE> categoryid: <ID>
7. /panel closed-category type: <TICKET_TYPE> categoryid: <ID>
8. /panel settings-panel category: <TICKET_TYPE> type: <VALUE_TYPE> value: <NEW_VALUE>
9. /panel settings-category category: <TICKET_TYPE> type: <VALUE_TYPE> value: <NEW_VALUE>

# Other commands
- /panel category-add <VALUES...>
- /panel category-remove <TICKET_TYPE>

# Troubleshooting
- Delete database and start over.