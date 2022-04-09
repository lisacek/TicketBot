class Category {

    constructor(id, categoryId, closedCategoryId, allowedRoles, pingRoles, message, embed) {
        this.id = id;
        this.categoryId = categoryId;
        this.closedCategoryId = closedCategoryId;
        this.allowedRoles = allowedRoles;
        this.pingRoles = pingRoles;
        this.message = message;
        this.embed = embed;
    }

}

module.exports.Category = Category;