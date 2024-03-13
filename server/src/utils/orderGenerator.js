// Function to generate the order description based on products and quantities
function generateOrderDescription(productsData, quantitySpecifications) {
    const description = [];
    const orderDescription = productsData.map((product) => {
        // Find the quantity specification for the current product
        const thisSpecifications = quantitySpecifications.find(
            (field) => field.productId === product._id
        );

        // Calculate the total cost for the current product batch
        const thisBatchTotalCost = product.price * thisSpecifications.quantity;
        description.push({
            product: {
                name: product.name,
                price: product.price,
            },
            quantity: quantity,
            total: productTotal,
        });

        // Return an object representing the product in the order description
        return {
            product: {
                name: product.name,
                price: product.price,
            },
            quantity: thisSpecifications.quantity,
            total: thisBatchTotalCost,
        };
    });

    return orderDescription;
}

// Function to calculate the total cost of the order
function getTotalCost(orderDescription) {
    return orderDescription.reduce((sum, product) => sum + product.total, 0);
}

// Factory function to create an order object
function orderFactory({
    productsData,
    quantitySpecifications,
    clientId,
    orderId,
}) {
    console.log(productsData);
    console.log(quantitySpecifications);
    // Validate input data
    if (
        productsData.length < 1 ||
        productsData.length !== quantitySpecifications.length
    ) {
        throw new Error("Invalid products data provided");
    }

    if (!clientId || !orderId) {
        throw new Error("Client ID and Order ID are required");
    }

    // Generate the order description and calculate the total cost
    const orderDescription = generateOrderDescription(
        productsData,
        quantitySpecifications
    );
    const orderTotalCost = getTotalCost(orderDescription);

    // Create and return the order object
    const order = {
        _id: orderId,
        client: clientId,
        description: orderDescription,
        total: orderTotalCost,
    };

    return order;
}

// Export the orderFactory function
module.exports = orderFactory;
