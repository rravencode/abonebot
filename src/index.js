// @ts-check

const { Client, IntentsBitField, Partials, PermissionsBitField } = require('discord.js');

const config = require('./config');
const { readingPhoto, sendChannelLlog } = require('./lib');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User],
    allowedMentions: {
        parse: ['everyone', 'roles', 'users']
    }
});

process.on("unhandledRejection", console.log).on("uncaughtException", console.log);

client.once('ready', (client) => console.log(`Logged in as ${client.user.username}`));

client.on('messageCreate', async (message) => {
    if(message.author.bot) return;
    if(!message.guild) return;

    const role = await message.guild.roles.fetch(config.settings.roleId);
	
	if(message.channel.id !== config.settings.channelId) return;
	
    if(message.member?.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
    if(message.member?.roles.cache.has(`${role?.id}`)) return message.delete().then(() => {});

    if(!message.attachments.first()) return message.delete().then(() => {});

    let msg = await message.reply({
        embeds: [{
            color: 0x2B2D31,
            title: 'Okuma işlemi başlatıldı..',
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            },
            description: '<a:sayac:1104370737466322976> **|** Fotoğraf okunuyor, lütfen bekleyiniz.',
            timestamp: new Date().toISOString(),
            footer: {
                text: `${client.user?.username} © 2023`,
                icon_url: client.user?.displayAvatarURL()
            }
        }]
    });

    let attachment = message.attachments.first();
    let picture = await readingPhoto(`${attachment?.url}`);

    let isSubscribed = false;

    for(const lang of config.langs) {
        if(picture.includes(lang) && picture.includes(config.channelName)) {
            isSubscribed = true;
        }
    }

    if(!isSubscribed) {
        await sendChannelLlog(message);

        msg.edit({
            embeds: [{
                color: 0x2B2D31,
                title: 'Okuma işlemi sonlandırıldı',
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                },
                description: `❌ **|** Lütfen fotoğrafı daha büyük şekilde gösterin.`,
                timestamp: new Date().toISOString(),
                footer: {
                    text: `${client.user?.username} © 2023`,
                    icon_url: client.user?.displayAvatarURL()
                }
            }]
        }).then((msg) => setTimeout(() => {
            msg.delete(),
            message.delete()
        }, 5000));

        return;
    }

    await sendChannelLlog(message);
    message.member?.roles.add(`${role?.id}`);

    msg.edit({
        embeds: [{
            color: 0x2B2D31,
            title: 'Okuma işlemi sonlandırıldı',
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            },
            description: `✅ **|** Yaşasın, artık abone rolüne sahipsin.`,
            timestamp: new Date().toISOString(),
            footer: {
                text: `${client.user?.username} © 2023`,
                icon_url: client.user?.displayAvatarURL()
            }
        }]
    }).then((msg) => setTimeout(() => {
        msg.delete(),
        message.delete()
    }, 5000));
});

process.on('unhandledRejection', error => {
	return console.log("Hata olustu: "+error)
});

client.login(config.discord.token);