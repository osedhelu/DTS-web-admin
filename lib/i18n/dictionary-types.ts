export interface Dictionary {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    brand: string;
    howItWorks: string;
    merchants: string;
    drivers: string;
    login: string;
    register: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaMerchant: string;
    ctaDriver: string;
    ctaSecondary: string;
  };
  stats: Array<{ value: string; label: string }>;
  howItWorks: {
    title: string;
    subtitle: string;
    steps: Array<{ title: string; description: string }>;
  };
  merchants: {
    id: string;
    badge: string;
    title: string;
    description: string;
    features: string[];
    cta: string;
  };
  drivers: {
    id: string;
    badge: string;
    title: string;
    description: string;
    features: string[];
    cta: string;
    note: string;
  };
  customers: {
    title: string;
    description: string;
  };
  platform: {
    title: string;
    features: Array<{ title: string; description: string }>;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    tagline: string;
    product: string;
    legal: string;
    links: {
      merchants: string;
      drivers: string;
      login: string;
      licenses: string;
      privacy: string;
      terms: string;
      deleteAccount: string;
      appReview: string;
    };
    rights: string;
  };
  licenses: {
    title: string;
    intro: string;
    platform: {
      title: string;
      content: string;
    };
    opensource: {
      title: string;
      items: Array<{ name: string; license: string; url: string }>;
    };
    back: string;
  };
  legalCommon: {
    back: string;
    supportEmail: string;
    lastUpdated: string;
  };
  privacy: {
    title: string;
    intro: string;
    sections: Array<{ title: string; paragraphs: string[] }>;
  };
  terms: {
    title: string;
    intro: string;
    sections: Array<{ title: string; paragraphs: string[] }>;
  };
  deleteAccount: {
    title: string;
    intro: string;
    sections: Array<{ title: string; paragraphs: string[] }>;
    form: {
      nameLabel: string;
      emailLabel: string;
      appLabel: string;
      appCustomer: string;
      appDriver: string;
      appMerchant: string;
      confirmLabel: string;
      submit: string;
      submitting: string;
      success: string;
      error: string;
      supportHint: string;
    };
  };
  appReview: {
    title: string;
    intro: string;
    sections: Array<{ title: string; paragraphs: string[] }>;
  };
}
