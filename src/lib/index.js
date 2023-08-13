// @ts-check

const { Message, ChannelType } = require('discord.js');
const tesseract = require('tesseract.js');

const config = require('../config');

module.exports = {
    /**
     * @param {string} photo
     */
    async readingPhoto(photo) {
        const { data: { text } } = await tesseract.recognize(photo, 'tur');

        return text;
    },
    /**
     * 
     * @param {Message} message 
     */
    async sendChannelLlog(message) {
        let channel = await message.guild?.channels.fetch(config.settings.channelLoggerId);

        if(channel && channel.type === ChannelType.GuildText) {
            channel.send({
                embeds: [{
                    color: 0x2B2D31,
                    image: {
                        url: `${message.attachments.first()?.url}`
                    },
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: message.author.tag+ 'tarafından gönderildi.',
                        icon_url: message.author.displayAvatarURL()
                    },
                }]
            })
        }
    }
}