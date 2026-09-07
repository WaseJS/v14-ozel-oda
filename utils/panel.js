const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags
} = require('discord.js');

const { generatePanelImage } = require('./generatePanel');
const config = require('../wase.json');

const e = config.emojis || {};

function buildButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('rename')
        .setLabel('Oda İsmi')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(e.rename || '✏️'),

      new ButtonBuilder()
        .setCustomId('setlimit')
        .setLabel('Oda Limiti')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(e.limit || '👥'),

      new ButtonBuilder()
        .setCustomId('lock')
        .setLabel('Kilitle')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(e.lock || '🔒'),

      new ButtonBuilder()
        .setCustomId('unlock')
        .setLabel('Aç')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(e.unlock || '🔓')
    ),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hide')
        .setLabel('Gizle')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(e.hide || '👁️‍🗨️'),

      new ButtonBuilder()
        .setCustomId('show')
        .setLabel('Göster')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(e.show || '👁️'),

      new ButtonBuilder()
        .setCustomId('ban')
        .setLabel('Banla')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(e.ban || '🚫'),

      new ButtonBuilder()
        .setCustomId('unban')
        .setLabel('Ban Aç')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(e.unban || '✅')
    ),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('call')
        .setLabel('Çağır')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(e.call || '📢'),

      new ButtonBuilder()
        .setCustomId('kick')
        .setLabel('At')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(e.kick || '👢')
    )
  ];
}

async function createControlPanel(guild) {
  const iconURL = guild.iconURL({
    extension: 'png',
    size: 512,
    forceStatic: true
  });

  /*
   * joinChannelId üzerinden gerçek kanal adını alıyoruz.
   * Böylece panelde "katılım kanalı" sabit yazılmak yerine
   * Discord'daki gerçek kanal adı gösterilecek.
   */
  let joinChannelName = 'Oluşturma Kanalı';

  try {
    const joinChannel = await guild.channels.fetch(config.joinChannelId);

    if (joinChannel) {
      joinChannelName = joinChannel.name;
    }
  } catch (err) {
    console.warn(
      `[Panel] Join kanalı alınamadı: ${err.message}`
    );
  }

  const png = await generatePanelImage({
    guildName: guild.name,
    guildIconURL: iconURL,
    joinChannelName,
    emojiIds: config.emojiIds || {}
  });

  const file = new AttachmentBuilder(png, {
    name: 'panel.png'
  });

  const container = new ContainerBuilder()
    .setAccentColor(0x000000)

    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL('attachment://panel.png')
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    );

  for (const row of buildButtons()) {
    container.addActionRowComponents(row);
  }

  return {
    files: [file],
    components: [container],
    flags: MessageFlags.IsComponentsV2
  };
}

function createInfoMessage(content, color = 0xED4245) {
  const container = new ContainerBuilder()
    .setAccentColor(color)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(content)
    );

  return {
    components: [container],
    flags: MessageFlags.IsComponentsV2
  };
}

module.exports = {
  createControlPanel,
  createInfoMessage,
  buildButtons
};