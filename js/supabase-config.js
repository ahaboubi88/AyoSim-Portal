/**
 * AyoSim Supabase Configuration
 *
 * To connect your live Supabase project:
 * 1. Create a project at https://supabase.com
 * 2. Copy the Project URL and anon / public API key from Project Settings > API
 * 3. Replace the placeholder values below:
 *      url: 'https://your-project-ref.supabase.co',
 *      anonKey: 'your-actual-anon-key'
 * 4. Enable Email & Social OAuth (Google, GitHub) providers in Authentication > Providers
 * 
 * When url or anonKey are set to placeholders or empty, AyoSim runs in
 * Demo/Mock Auth Mode, enabling full client testing without live credentials.
 */

window.AYOSIM_SUPABASE_CONFIG = {
  url: 'https://placeholder-project.supabase.co',
  anonKey: 'placeholder-anon-key-replace-with-your-supabase-anon-key',

  /**
   * Checks whether valid live Supabase credentials have been configured.
   * @returns {boolean}
   */
  isConfigured: function () {
    return (
      Boolean(this.url) &&
      Boolean(this.anonKey) &&
      !this.url.includes('placeholder-project') &&
      !this.anonKey.includes('placeholder-anon-key') &&
      this.url.startsWith('https://')
    );
  }
};
