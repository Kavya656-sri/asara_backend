import amqp from 'amqplib';

const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'contacts.events';
let channelPromise = null;

async function getChannel() {
    if (!channelPromise) {
        channelPromise = new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error("RabbitMQ connect timeout")), 3000);
            try {
                const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
                const channel = await conn.createChannel();
                await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
                clearTimeout(timeoutId);
                resolve(channel);
            } catch (err) {
                clearTimeout(timeoutId);
                reject(err);
            }
        });
    }
    return channelPromise;
}

/**
 * Publishes a contact domain event so downstream services (ticket-service,
 * task-project-service for read-model sync; integration-freshdesk-service
 * for the external sync) can react asynchronously instead of the request
 * blocking on them.
 *
 * routingKey examples: "contact.created", "contact.updated", "contact.deleted"
 */
export async function publishContactEvent(routingKey, payload) {
    try {
        const channel = await getChannel();
        const message = Buffer.from(JSON.stringify({
            eventType: routingKey,
            occurredAt: new Date().toISOString(),
            data: payload
        }));
        channel.publish(EXCHANGE, routingKey, message, { persistent: true, contentType: 'application/json' });
    } catch (err) {
        // Publishing failure should never fail the HTTP request - log and
        // move on. Add a retry/outbox table here for stronger guarantees.
        console.error(`Failed to publish ${routingKey}:`, err.message);
    }
}
