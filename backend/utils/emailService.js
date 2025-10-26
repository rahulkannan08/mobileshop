const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

exports.sendOrderConfirmation = async (email, order) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: `
            <h1>Order Confirmed!</h1>
            <p>Your order ${order.orderNumber} has been placed successfully.</p>
            <p>Total Amount: ₹${order.totalAmount}</p>
            <p>We'll notify you when your order is shipped.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

exports.sendOrderStatusUpdate = async (email, order, status) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Order Update - ${order.orderNumber}`,
        html: `
            <h1>Order Status Updated</h1>
            <p>Your order ${order.orderNumber} status: <strong>${status}</strong></p>
        `
    };

    await transporter.sendMail(mailOptions);
};