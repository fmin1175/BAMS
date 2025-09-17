import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface NotificationData {
  studentName: string;
  parentEmail: string;
  parentPhone: string;
  className: string;
  date: string;
  status: 'ABSENT' | 'LATE';
  remarks?: string;
}

export interface NotificationResult {
  success: boolean;
  message: string;
  notificationId?: string;
}

// Email notification service
export async function sendEmailNotification(data: NotificationData): Promise<NotificationResult> {
  try {
    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Resend
    
    const emailContent = generateEmailContent(data);
    
    // Mock email sending - replace with actual email service
    console.log('Sending email notification:', {
      to: data.parentEmail,
      subject: emailContent.subject,
      body: emailContent.body
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Log notification in database
    await logNotification({
      type: 'EMAIL',
      recipient: data.parentEmail,
      studentName: data.studentName,
      className: data.className,
      date: data.date,
      status: data.status,
      content: emailContent.body,
      sent: true
    });

    return {
      success: true,
      message: 'Email notification sent successfully',
      notificationId: `email_${Date.now()}`
    };

  } catch (error) {
    console.error('Error sending email notification:', error);
    
    // Log failed notification
    await logNotification({
      type: 'EMAIL',
      recipient: data.parentEmail,
      studentName: data.studentName,
      className: data.className,
      date: data.date,
      status: data.status,
      content: 'Failed to send',
      sent: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      message: 'Failed to send email notification'
    };
  }
}

// SMS notification service
export async function sendSMSNotification(data: NotificationData): Promise<NotificationResult> {
  try {
    // In a real implementation, you would integrate with an SMS service like:
    // - Twilio
    // - AWS SNS
    // - MessageBird
    // - Vonage (Nexmo)
    
    const smsContent = generateSMSContent(data);
    
    // Mock SMS sending - replace with actual SMS service
    console.log('Sending SMS notification:', {
      to: data.parentPhone,
      message: smsContent
    });

    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Log notification in database
    await logNotification({
      type: 'SMS',
      recipient: data.parentPhone,
      studentName: data.studentName,
      className: data.className,
      date: data.date,
      status: data.status,
      content: smsContent,
      sent: true
    });

    return {
      success: true,
      message: 'SMS notification sent successfully',
      notificationId: `sms_${Date.now()}`
    };

  } catch (error) {
    console.error('Error sending SMS notification:', error);
    
    // Log failed notification
    await logNotification({
      type: 'SMS',
      recipient: data.parentPhone,
      studentName: data.studentName,
      className: data.className,
      date: data.date,
      status: data.status,
      content: 'Failed to send',
      sent: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      message: 'Failed to send SMS notification'
    };
  }
}

// Send both email and SMS notifications
export async function sendParentNotification(data: NotificationData): Promise<{
  email: NotificationResult;
  sms: NotificationResult;
}> {
  const [emailResult, smsResult] = await Promise.all([
    sendEmailNotification(data),
    sendSMSNotification(data)
  ]);

  return {
    email: emailResult,
    sms: smsResult
  };
}

// Generate email content
function generateEmailContent(data: NotificationData): { subject: string; body: string } {
  const subject = `Attendance Alert: ${data.studentName} - ${data.className}`;
  
  const body = `
Dear Parent/Guardian,

This is to inform you about your child's attendance for today's badminton class.

Student: ${data.studentName}
Class: ${data.className}
Date: ${new Date(data.date).toLocaleDateString()}
Status: ${data.status === 'ABSENT' ? 'Absent' : 'Late'}
${data.remarks ? `Remarks: ${data.remarks}` : ''}

${data.status === 'ABSENT' 
  ? 'Your child was marked as absent from today\'s class. If this was unexpected, please contact us to discuss.'
  : 'Your child arrived late to today\'s class. Please ensure they arrive on time for future sessions.'
}

If you have any questions or concerns, please don't hesitate to contact us.

Best regards,
Badminton Academy Management Team

---
This is an automated message from the Badminton Academy Management System.
  `.trim();

  return { subject, body };
}

// Generate SMS content
function generateSMSContent(data: NotificationData): string {
  const statusText = data.status === 'ABSENT' ? 'absent from' : 'late to';
  const remarksText = data.remarks ? ` (${data.remarks})` : '';
  
  return `BAMS Alert: ${data.studentName} was ${statusText} ${data.className} class today${remarksText}. Please contact us if you have any questions.`;
}

// Log notification in database
async function logNotification(logData: {
  type: 'EMAIL' | 'SMS';
  recipient: string;
  studentName: string;
  className: string;
  date: string;
  status: 'ABSENT' | 'LATE';
  content: string;
  sent: boolean;
  error?: string;
}) {
  try {
    // In a real implementation, you might want to create a notifications table
    // For now, we'll just log to console
    console.log('Notification log:', {
      timestamp: new Date().toISOString(),
      ...logData
    });
    
    // TODO: Create a notifications table in the database to track all sent notifications
    // await prisma.notification.create({
    //   data: {
    //     type: logData.type,
    //     recipient: logData.recipient,
    //     content: logData.content,
    //     sent: logData.sent,
    //     error: logData.error,
    //     metadata: JSON.stringify({
    //       studentName: logData.studentName,
    //       className: logData.className,
    //       date: logData.date,
    //       status: logData.status
    //     })
    //   }
    // });

  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

// Process attendance and send notifications for absent students
export async function processAttendanceNotifications(sessionId: number) {
  try {
    // Get all absent students for the session
    const absentAttendance = await prisma.attendance.findMany({
      where: {
        sessionId: sessionId,
        status: 'ABSENT',
        notificationSent: false
      },
      include: {
        enrollment: {
          include: {
            student: true
          }
        },
        session: {
          include: {
            class: true
          }
        }
      }
    });

    const notificationPromises = absentAttendance.map(async (attendance) => {
      const student = attendance.enrollment.student;
      const session = attendance.session;
      
      const notificationData: NotificationData = {
        studentName: student.name,
        parentEmail: student.guardianName, // Using guardianName as parent contact
        parentPhone: student.contactNumber,
        className: session.class.name,
        date: session.date.toISOString(),
        status: attendance.status as 'ABSENT',
        remarks: attendance.remarks || undefined
      };

      // Send notifications
      const results = await sendParentNotification(notificationData);
      
      // Update attendance record to mark notification as sent
      await prisma.attendance.update({
        where: { id: attendance.id },
        data: { notificationSent: true }
      });

      return {
        attendanceId: attendance.id,
        studentName: notificationData.studentName,
        email: results.email,
        sms: results.sms
      };
    });

    const results = await Promise.all(notificationPromises);
    
    return {
      success: true,
      processedCount: results.length,
      results
    };

  } catch (error) {
    console.error('Error processing attendance notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}