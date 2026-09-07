const {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  Events,
  Collection,
  ActivityType
} = require('discord.js');

const mongoose = require('mongoose');
const config = require('./wase.json');
const User = require('./models/User');
const { createControlPanel, createInfoMessage } = require('./utils/panel');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const tempChannels = new Collection();
const e = config.emojis || {};

async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 15000,
      family: 4
    });
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (err) {
    console.error('❌ MongoDB bağlantı hatası:', err);
    process.exit(1);
  }
}

async function getUserData(userId) {
  let user = await User.findOne({ userId });
  if (!user) user = await User.create({ userId });
  return user;
}

function findOwnedChannel(userId, guild) {
  for (const [channelId, ownerId] of tempChannels) {
    if (ownerId === userId) {
      const ch = guild.channels.cache.get(channelId);
      if (ch) return ch;
    }
  }
  return null;
}

client.once(Events.ClientReady, async () => {
  await connectDB();
  console.log(`🤖 Bot hazır: ${client.user.tag}`);

  client.user.setPresence({
    activities: [{
      name: '🍻 Powered By. Wase',
      type: ActivityType.Streaming,
      url: 'https://www.twitch.tv/thewasetrox'
    }],
    status: 'dnd'
  });

  try {
    const channel = await client.channels.fetch(config.botVoiceChannelId);
    if (channel && channel.isVoiceBased()) {
      const { joinVoiceChannel } = require('@discordjs/voice');
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: true
      });
      console.log(`🔉 Bot ses kanalına girdi: ${channel.name}`);
    }
  } catch (err) {
    console.error('❌ Bot ses kanalına giremedi:', err.message);
  }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (newState.channelId === config.joinChannelId && oldState.channelId !== config.joinChannelId) {
    const member = newState.member;
    const guild = newState.guild;
    const userId = member.id;

    try {
      const userData = await getUserData(userId);
      const channelName = userData.name || `${member.user.username}'nın Odası`;
      const userLimit = userData.limit ?? 0;

      const newChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: config.categoryId,
        userLimit,
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
          },
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers
            ]
          }
        ]
      });

      await member.voice.setChannel(newChannel);
      tempChannels.set(newChannel.id, userId);
      console.log(`Oda oluşturuldu: ${channelName} → ${member.user.tag}`);
    } catch (err) {
      console.error('Oda oluşturma hatası:', err);
    }
  }

  if (oldState.channel && tempChannels.has(oldState.channel.id)) {
    const channel = oldState.channel;
    if (channel.members.filter(m => !m.user.bot).size === 0) {
      setTimeout(async () => {
        try {
          if (channel.members.filter(m => !m.user.bot).size === 0) {
            await channel.delete('Oda boşaldı (5 saniye)');
            tempChannels.delete(channel.id);
            console.log(`Oda silindi: ${channel.name}`);
          }
        } catch {}
      }, 5000);
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'controlpanel' || command === 'cp') {
    if (!config.allowedUsers.includes(message.author.id)) {
      return message.reply(createInfoMessage(`${e.error || '❌'} Paneli sadece yetkililer kurabilir.`));
    }

    try {
      const panel = await createControlPanel(message.guild);
      await message.channel.send(panel);
      try { await message.delete(); } catch {}
    } catch (err) {
      console.error('Panel üretilemedi:', err);
      return message.reply(createInfoMessage(`${e.error || '❌'} Panel oluşturulamadı.`));
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton() && !interaction.isModalSubmit()) return;

  const member = interaction.member;
  const voiceChannel = findOwnedChannel(member.id, interaction.guild);

  if (!voiceChannel) {
    return interaction.reply({
      ...createInfoMessage(`${e.error || '❌'} Aktif odan yok!\nÖnce join kanalına girip oda oluştur.`),
      ephemeral: true
    });
  }

  if (interaction.isButton()) {
    const id = interaction.customId;

    if (id === 'lock') {
      await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { Connect: false });
      return interaction.reply({
        ...createInfoMessage(`${e.lock || '🔒'} Oda kilitlendi!`, 0x57F287),
        ephemeral: true
      });
    }
    if (id === 'unlock') {
      await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { Connect: true });
      return interaction.reply({
        ...createInfoMessage(`${e.unlock || '🔓'} Oda açıldı!`, 0x57F287),
        ephemeral: true
      });
    }
    if (id === 'hide') {
      await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false });
      return interaction.reply({
        ...createInfoMessage(`${e.hide || '👁️‍🗨️'} Oda gizlendi!`, 0x57F287),
        ephemeral: true
      });
    }
    if (id === 'show') {
      await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: true });
      return interaction.reply({
        ...createInfoMessage(`${e.show || '👁️'} Oda gösterildi!`, 0x57F287),
        ephemeral: true
      });
    }

    if (['ban', 'unban', 'call', 'kick', 'rename', 'setlimit', 'sil', 'copy'].includes(id)) {
      const titles = {
        ban: 'Kullanıcıyı Banla',
        unban: 'Banı Kaldır',
        call: 'Kullanıcıyı Çağır',
        kick: 'Odadan At',
        rename: 'Oda İsmini Değiştir',
        setlimit: 'Kullanıcı Limiti Ayarla',
        sil: 'Odayı Sil',
        copy: 'Odayı Kopyala'
      };

      const labels = {
        ban: 'Kullanıcı adı veya ID',
        unban: 'Kullanıcı adı veya ID',
        call: 'Kullanıcı adı veya ID',
        kick: 'Kullanıcı adı veya ID',
        rename: 'Yeni oda ismi',
        setlimit: 'Limit (0 = sınırsız, max 99)',
        sil: 'Onaylamak için "sil" yaz',
        copy: 'Kopyalanacak kullanıcı adı veya ID'
      };

      const modal = new ModalBuilder()
        .setCustomId(`modal_${id}`)
        .setTitle(titles[id]);

      const input = new TextInputBuilder()
        .setCustomId('target')
        .setLabel(labels[id])
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(id === 'rename' ? 100 : 50);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    const id = interaction.customId.replace('modal_', '');
    const targetInput = interaction.fields.getTextInputValue('target').trim();
    const userId = member.id;

    if (id === 'rename') {
      const newName = targetInput.slice(0, 100);
      try {
        await voiceChannel.setName(newName);
        await User.findOneAndUpdate({ userId }, { name: newName }, { upsert: true });
        return interaction.reply({
          ...createInfoMessage(`${e.rename || '✏️'} Oda ismi **${newName}** kaydedildi!`, 0x57F287),
          ephemeral: true
        });
      } catch {
        return interaction.reply({
          ...createInfoMessage(`${e.error || '❌'} İsim değiştirilemedi.`, 0xED4245),
          ephemeral: true
        });
      }
    }

    if (id === 'setlimit') {
      const limit = parseInt(targetInput);
      if (isNaN(limit) || limit < 0 || limit > 99) {
        return interaction.reply({
          ...createInfoMessage(`${e.error || '❌'} Limit 0-99 arasında olmalı.`, 0xED4245),
          ephemeral: true
        });
      }
      try {
        await voiceChannel.setUserLimit(limit);
        await User.findOneAndUpdate({ userId }, { limit }, { upsert: true });
        const text = limit === 0 ? 'Sınırsız' : String(limit);
        return interaction.reply({
          ...createInfoMessage(`${e.limit || '👥'} Limit **${text}** kaydedildi!`, 0x57F287),
          ephemeral: true
        });
      } catch {
        return interaction.reply({
          ...createInfoMessage(`${e.error || '❌'} Limit ayarlanamadı.`, 0xED4245),
          ephemeral: true
        });
      }
    }

    if (id === 'ban') {
      let targetMember = null;
      if (/^\d{17,19}$/.test(targetInput)) {
        targetMember = await interaction.guild.members.fetch(targetInput).catch(() => null);
      }
      if (!targetMember) {
        targetMember = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === targetInput.toLowerCase() || m.displayName.toLowerCase() === targetInput.toLowerCase());
      }
      if (!targetMember) return interaction.reply({ ...createInfoMessage(`${e.error || '❌'} Kullanıcı bulunamadı!`, 0xED4245), ephemeral: true });

      await voiceChannel.permissionOverwrites.edit(targetMember.id, { Connect: false, ViewChannel: false });
      return interaction.reply({
        ...createInfoMessage(`${e.ban || '🚫'} **${targetMember.user.username}** banlandı.`, 0x57F287),
        ephemeral: true
      });
    }

    if (id === 'unban') {
      let targetMember = null;
      if (/^\d{17,19}$/.test(targetInput)) {
        targetMember = await interaction.guild.members.fetch(targetInput).catch(() => null);
      }
      if (!targetMember) {
        targetMember = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === targetInput.toLowerCase() || m.displayName.toLowerCase() === targetInput.toLowerCase());
      }
      if (!targetMember) return interaction.reply({ ...createInfoMessage(`${e.error || '❌'} Kullanıcı bulunamadı!`, 0xED4245), ephemeral: true });

      await voiceChannel.permissionOverwrites.delete(targetMember.id);
      return interaction.reply({
        ...createInfoMessage(`${e.unban || '✅'} **${targetMember.user.username}** banı kaldırıldı.`, 0x57F287),
        ephemeral: true
      });
    }

    if (id === 'call') {
      let targetMember = null;
      if (/^\d{17,19}$/.test(targetInput)) {
        targetMember = await interaction.guild.members.fetch(targetInput).catch(() => null);
      }
      if (!targetMember) {
        targetMember = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === targetInput.toLowerCase() || m.displayName.toLowerCase() === targetInput.toLowerCase());
      }
      if (!targetMember) return interaction.reply({ ...createInfoMessage(`${e.error || '❌'} Kullanıcı bulunamadı!`, 0xED4245), ephemeral: true });

      try {
        await targetMember.send(`${e.call || '📢'} **${interaction.user.username}** seni **${voiceChannel.name}** odasına çağırıyor!\nSunucu: **${interaction.guild.name}**\nKanal: ${voiceChannel}`);
        return interaction.reply({
          ...createInfoMessage(`${e.call || '📢'} **${targetMember.user.username}** çağrıldı.`, 0x57F287),
          ephemeral: true
        });
      } catch {
        return interaction.reply({ ...createInfoMessage(`${e.error || '❌'} DM atılamadı.`, 0xED4245), ephemeral: true });
      }
    }

    if (id === 'kick') {
      let targetMember = null;
      if (/^\d{17,19}$/.test(targetInput)) {
        targetMember = await interaction.guild.members.fetch(targetInput).catch(() => null);
      }
      if (!targetMember) {
        targetMember = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === targetInput.toLowerCase() || m.displayName.toLowerCase() === targetInput.toLowerCase());
      }
      if (!targetMember) return interaction.reply({ ...createInfoMessage(`${e.error || '❌'} Kullanıcı bulunamadı!`, 0xED4245), ephemeral: true });

      if (targetMember.voice.channelId === voiceChannel.id) {
        await targetMember.voice.disconnect('Oda sahibi tarafından atıldı');
        return interaction.reply({
          ...createInfoMessage(`${e.kick || '👢'} **${targetMember.user.username}** atıldı.`, 0x57F287),
          ephemeral: true
        });
      } else {
        return interaction.reply({ ...createInfoMessage(`${e.error || '❌'} Bu kullanıcı odanda değil.`, 0xED4245), ephemeral: true });
      }
    }

    if (id === 'sil') {
      if (targetInput.toLowerCase() === 'sil') {
        try {
          await voiceChannel.delete('Oda sahibi tarafından silindi');
          tempChannels.delete(voiceChannel.id);
          return interaction.reply({
            ...createInfoMessage(`${e.error || '🗑️'} Oda silindi!`, 0x57F287),
            ephemeral: true
          });
        } catch {
          return interaction.reply({
            ...createInfoMessage(`${e.error || '❌'} Oda silinemedi.`, 0xED4245),
            ephemeral: true
          });
        }
      }
      return interaction.reply({
        ...createInfoMessage(`${e.error || '❌'} Silmek için "sil" yazman lazım.`, 0xED4245),
        ephemeral: true
      });
    }

    if (id === 'copy') {
      let targetMember = null;
      if (/^\d{17,19}$/.test(targetInput)) {
        targetMember = await interaction.guild.members.fetch(targetInput).catch(() => null);
      }
      if (!targetMember) {
        targetMember = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === targetInput.toLowerCase() || m.displayName.toLowerCase() === targetInput.toLowerCase());
      }
      if (!targetMember) return interaction.reply({ ...createInfoMessage(`${e.error || '❌'} Kullanıcı bulunamadı!`, 0xED4245), ephemeral: true });

      return interaction.reply({
        ...createInfoMessage(`${e.success || '✅'} **${targetMember.user.username}** odaya kopyalandı.`, 0x57F287),
        ephemeral: true
      });
    }
  }
});

client.login(config.token);