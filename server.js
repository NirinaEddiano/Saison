const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

app.post('/send-email', async (req, res) => {
  const { firstName, lastName, email, phone, address, message } = req.body;
  
  // Validation des données
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  // Email à l'entreprise
  const mailToCompany = {
    from: `"Saison +" <${process.env.EMAIL_USER}>`,
    to: process.env.COMPANY_EMAIL,
    subject: `Nouveau message de contact - Saison + de la part de ${firstName} ${lastName}`,
    replyTo: email,
    html: `
      <h2>Nouveau message de ${email} </h2>
      <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email(cliquer sur 'Répondre' pour lui écrire):</strong> ${email}</p>
      <p><strong>Téléphone:</strong> ${phone || 'Non fourni'}</p>
      <p><strong>Adresse:</strong> ${address || 'Non fournie'}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  const mailToUser = {
    from: `"Saison +" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Votre message bien reçu par Saison +',
    html: `
      <h2>Merci pour votre message !</h2>
      <p>Cher(e) ${firstName} ${lastName},</p>
      <p>Nous avons bien reçu votre message. Notre équipe vous contactera dans les plus brefs délais pour discuter de vos besoins en nettoyage de fenêtres, vidage de gouttières, lavage à pression ou installation de grillages de gouttières.</p>
      <p><strong>Récapitulatif de votre message :</strong></p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Téléphone:</strong> ${phone || 'Non fourni'}</p>
      <p><strong>Adresse:</strong> ${address || 'Non fournie'}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p>Merci de votre confiance en Saison + !</p>
      <p>Équipe Saison +</p>
      <p><a href="https://saisonplus.com">Visitez notre site</a></p>
    `,
  };

  try {
    await transporter.sendMail(mailToCompany);
    await transporter.sendMail(mailToUser);
    res.status(200).json({ message: 'Emails envoyés avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des emails:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi des emails' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});