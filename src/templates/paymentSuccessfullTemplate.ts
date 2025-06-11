function paymentSuccessfullTemplate(
  courseName: string,
  courseId: string,
  amount: number,
  studentName: string,
  paymentId: String,
  paymentDate: string,
  orderId: string
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
        }
        .logo {
            max-width: 180px;
            margin-bottom: 10px;
        }
        .success-icon {
            width: 64px;
            height: 64px;
            margin: 20px auto;
            display: block;
        }
        h1 {
            color: #2e7d32;
            font-size: 24px;
            margin: 0;
            padding: 0;
        }
        .content {
            padding: 20px 0;
        }
        .order-details {
            background-color: #f5f5f5;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .detail-label {
            font-weight: 600;
            color: #555;
        }
        .detail-value {
            text-align: right;
        }
        .amount {
            font-size: 18px;
            font-weight: bold;
            color: #2e7d32;
        }
        .cta-button {
            display: block;
            text-align: center;
            background-color: #1976d2;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            margin: 30px auto;
            font-weight: 600;
            width: 200px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 20px;
        }
        .social-icons {
            text-align: center;
            margin: 15px 0;
        }
        .social-icons a {
            display: inline-block;
            margin: 0 5px;
        }
        .social-icon {
            width: 24px;
            height: 24px;
        }
        @media (max-width: 480px) {
            .container {
                padding: 15px;
            }
            h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://via.placeholder.com/180x60?text=YourLogo" alt="Company Logo" class="logo">
            <img src="/api/placeholder/64/64" alt="Success" class="success-icon">
            <h1>Payment Successful!</h1>
        </div>
        
        <div class="content">
            <p>Dear ${studentName},</p>
            
            <p>We're excited to confirm that your payment for <strong>${courseName}</strong> has been successfully processed. You now have full access to all course materials and resources.</p>
            
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Order ID : </span>
                    <span class="detail-value">${orderId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment ID : </span>
                    <span class="detail-value">${paymentId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date : </span>
                    <span class="detail-value">${paymentDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Course : </span>
                    <span class="detail-value">${courseName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Paid : </span>
                    <span class="detail-value amount">₹${amount}</span>
                </div>
            </div>
            
            <p>Your course is now ready and waiting for you. You can start learning right away!</p>
            
            <a href="http://localhost:5173/course/${courseId}" class="cta-button">Start Learning Now</a>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@example.com">support@example.com</a>.</p>
            
            <p>Happy learning!</p>
            
            <p>Best regards,<br>The Study Sync Team</p>
        </div>
        
        <div class="footer">
            <p>
                 &copy; 2025 Study Sync | All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
}

export default paymentSuccessfullTemplate;
