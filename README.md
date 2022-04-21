# TicketBot
TicketBot is a bot that allows users to create tickets in a ticketing system.<br>
Version: 1.0.0

# Setup
1. Rename configExample.json to config.json
2. Fill sql details and bot token
3. Start the bot
4. /panel send - Sends ticket panel
5. /panel ticket-category type: <TICKET_TYPE> categoryid: <ID>
6. /panel closed-category type: <TICKET_TYPE> categoryid: <ID>
7. /panel settings-panel category: <TICKET_TYPE> type: <VALUE_TYPE> value: <NEW_VALUE>
8. /panel settings-category category: <TICKET_TYPE> type: <VALUE_TYPE> value: <NEW_VALUE>

# Other commands
- /panel category-add <VALUES...>
- /panel category-remove <TICKET_TYPE>

# Troubleshooting
- Delete database and start over.