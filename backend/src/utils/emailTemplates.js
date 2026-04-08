/**
 * Email Templates for PetPaws Animal Hospital
 * Centralized registry of all HTML/Text templates dispatched by the system.
 */

/**
 * Dispatched when a client successfully updates their password.
 */
exports.getPasswordResetConfirmation = (clientName) => {
  return {
    subject: "Your Password Has Been Reset",
    text: `Dear ${clientName},

Your password has been successfully updated.

If you did not make this change, please contact us immediately.

Warm regards,
PetPaws Animal Hospital`
  };
};

/**
 * Dispatched when a new medical or grooming appointment is confirmed.
 */
exports.getAppointmentConfirmed = (clientName, petName, date, time, doctorName) => {
  return {
    subject: "Appointment Confirmation",
    text: `Dear ${clientName},

Your appointment has been successfully scheduled.

Details:
Pet Name: ${petName}
Date: ${date}
Time: ${time}
Doctor: ${doctorName}

Please arrive 10 minutes early.
We look forward to seeing you and your pet.

Warm regards,
PetPaws Animal Hospital`
  };
};

/**
 * Dispatched when a new pet profile is successfully registered under a client.
 */
exports.getPetAdded = (clientName, petName, type, breed) => {
  return {
    subject: "New Pet Added to Your Profile",
    text: `Dear ${clientName},

Your pet has been successfully added to your profile.

Pet Details:
Name: ${petName}
Type: ${type}
Breed: ${breed}

You can now manage appointments and records for this pet through your account.

Warm regards,
PetPaws Animal Hospital`
  };
};

/**
 * Dispatched when a financial invoice is generated.
 * Includes an optional feedback link mapped to the related appointment.
 */
exports.getInvoiceEmail = (clientName, invoiceId, amount, dueDate, appointmentId) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const feedbackLink = appointmentId ? `\n\nWe value your feedback! Please let us know how your visit went: ${frontendUrl}/feedback/${appointmentId}` : '';
  
  return {
    subject: "Your Invoice from PetPaws",
    text: `Dear ${clientName},

Your invoice is now available.

Invoice Details:
Invoice Number: INV-${invoiceId}
Amount: Rs. ${amount}
Due Date: ${dueDate}

Please make the payment by the due date.
If you have any questions, feel free to contact us.${feedbackLink}

Warm regards,
PetPaws Animal Hospital`
  };
};

/**
 * Dispatched immediately upon receiving a payment against an invoice.
 */
exports.getPaymentReceived = (clientName, amount, date, referenceId) => {
  return {
    subject: "Payment Received",
    text: `Dear ${clientName},

We have received your payment successfully.

Payment Details:
Amount: ${amount}
Date: ${date}
Reference: ${referenceId}

Thank you for your prompt payment.

Warm regards,
PetPaws Animal Hospital`
  };
};

/**
 * Dispatched when an invoice's total balance is fully paid and settled.
 */
exports.getPaymentCompleted = (clientName) => {
  return {
    subject: "Payment Completed Successfully",
    text: `Dear ${clientName},

Your payment has been completed successfully.
Your transaction has been processed, and no further action is required.

Thank you for choosing PetPaws Animal Hospital.

Warm regards,
PetPaws Animal Hospital`
  };
};
