class Ticket {

    constructor(id, guildId, userId, claimedBy, status, type, channelId, createdAt, lastActivityAt, closedAt) {
        this.id = id;
        this.guildId = guildId;
        this.userId = userId;
        this.claimedBy = claimedBy;
        this.status = status;
        this.type = type;
        this.channelId = channelId;
        this.createdAt = createdAt;
        this.lastActivityAt = lastActivityAt;
        this.closedAt = closedAt;
    }

}

module.exports.Ticket = Ticket;