import {
    ApplicationCommandOptionTypes,
    createBot,
    InteractionResponseTypes,
    InteractionTypes,
} from "discordeno";
import { transferTokens } from "@waylearn/faucet";

const bot = createBot({
    token: Deno.env.get("WAYLEARN_BOT_TOKEN") ?? "",
    applicationId: BigInt(Deno.env.get("APPLICATION_ID") ?? ""),
    desiredProperties: {
        interaction: {
            id: true,
            token: true,
            type: true,
            data: true,
            user: true,
            member: true,
        },
    },
    events: {
        interactionCreate(interaction) {
            if (!interaction) return;

            // TODO: slash command processor
            if (interaction.type === InteractionTypes.ApplicationCommand) {
                const commandName = interaction.data?.name;

                // TODO: server commands
                switch (commandName) {
                    case "ping":
                        return handlePing(interaction);
                    case "drip":
                        return handleDrip(interaction);
                        // case "faucet"
                }
                // TODO: user commands
                // "address balance"
                // TODO: registered user commands (DevAccount)
                // "transfer to"
            }
        },
    },
});

const handleDrip = async (interaction) => {
    await interaction.bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
            type: InteractionResponseTypes.DeferredChannelMessageWithSource,
        },
    );

    try {
        const reqAddress = interaction.data?.options?.[0]?.value as string;

        // TODO: check balance, return early if > max

        const signature = await transferTokens(reqAddress);

        await interaction.bot.helpers.editOriginalInteractionResponse(interaction.token, {
            content:
                `✅ Success! Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        });
    } catch (err) {
        await interaction.bot.helpers.editOriginalInteractionResponse(interaction.token, {
            content: `❌ Error: ${err.message}`,
        });
    }
};

const handlePing = async (interaction) => {
    await interaction.bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: { content: "🏓 Pong!" },
        },
    );
};

await bot.helpers.upsertGlobalApplicationCommands([
    {
        name: "ping",
        description: "Check if the faucet bot is alive",
    },
    {
        name: "drip",
        description: "Request devnet SOL",
        options: [
            {
                name: "address",
                description: "Your address",
                type: ApplicationCommandOptionTypes.String,
                required: true,
            },
        ],
    },
]);

console.log("✅ Commands registered!");

await bot.start();
