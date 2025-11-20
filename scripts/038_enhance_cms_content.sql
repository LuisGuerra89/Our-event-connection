-- Enhance CMS Content table for better About Us page management
ALTER TABLE public.cms_content
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS banner_image TEXT,
ADD COLUMN IF NOT EXISTS secondary_content TEXT,
ADD COLUMN IF NOT EXISTS additional_data JSONB DEFAULT '{}'::jsonb;

-- Update existing about_us content with better default HTML content
UPDATE public.cms_content
SET 
  subtitle = 'Connecting hearts through unforgettable events',
  content = '
<div class="space-y-8">
  <section>
    <h2>Our Story</h2>
    <p>Founded with a vision to revolutionize how people connect, EventMatch brings together singles through carefully curated social events. We believe that meaningful relationships start with shared experiences.</p>
  </section>

  <section>
    <h2>Our Mission</h2>
    <p>To create authentic connections by bringing people together through engaging, memorable events that foster genuine relationships. We&apos;re not just another dating platform – we&apos;re a community builder.</p>
  </section>

  <section>
    <h2>What Makes Us Different</h2>
    <ul>
      <li><strong>Real Events, Real Connections:</strong> Meet face-to-face in curated social settings, not just through screens.</li>
      <li><strong>Smart Matching:</strong> Our algorithm considers your preferences, interests, and compatibility factors.</li>
      <li><strong>Diverse Events:</strong> From speed dating to adventure activities, we offer something for everyone.</li>
      <li><strong>Safe Environment:</strong> All attendees are verified, and we maintain strict safety protocols.</li>
    </ul>
  </section>

  <section>
    <h2>Our Values</h2>
    <div class="grid md:grid-cols-2 gap-6 my-6">
      <div>
        <h3>Authenticity</h3>
        <p>We encourage genuine connections and real conversations.</p>
      </div>
      <div>
        <h3>Inclusivity</h3>
        <p>Everyone deserves to find meaningful connections, regardless of background.</p>
      </div>
      <div>
        <h3>Safety</h3>
        <p>Your security and comfort are our top priorities at every event.</p>
      </div>
      <div>
        <h3>Fun</h3>
        <p>Meeting someone special should be an enjoyable experience!</p>
      </div>
    </div>
  </section>
</div>
  ',
  secondary_content = '
<div class="text-center space-y-6">
  <h2>Join Our Community</h2>
  <p class="text-xl">Ready to start your journey? Browse our upcoming events and take the first step toward finding your perfect match.</p>
  <div class="flex flex-wrap gap-4 justify-center mt-8">
    <a href="/events" class="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">Browse Events</a>
    <a href="/auth/sign-up" class="inline-block px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors">Create Account</a>
  </div>
</div>
  '
WHERE page_key = 'about_us';

-- Update how_it_works content with step-by-step guide
UPDATE public.cms_content
SET 
  subtitle = 'Your journey to finding meaningful connections starts here',
  content = '
<div class="space-y-12">
  <div class="text-center mb-12">
    <p class="text-xl text-muted-foreground">Follow these simple steps to start your journey with EventMatch</p>
  </div>

  <!-- Step 1 -->
  <div class="grid md:grid-cols-2 gap-8 items-center">
    <div class="order-2 md:order-1">
      <div class="flex items-center gap-4 mb-4">
        <div class="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">1</div>
        <h2 class="text-3xl font-bold mb-0">Create Your Profile</h2>
      </div>
      <p class="text-lg">Sign up and complete your profile with your interests, preferences, and what you&apos;re looking for in a match. Our smart algorithm uses this information to find your perfect connections.</p>
      <ul class="mt-4">
        <li>Add your photos and bio</li>
        <li>Set your preferences and interests</li>
        <li>Verify your identity for safety</li>
      </ul>
    </div>
    <div class="order-1 md:order-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-8 h-64 flex items-center justify-center">
      <div class="text-center">
        <svg class="w-32 h-32 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <p class="mt-4 text-sm text-muted-foreground">Profile Setup</p>
      </div>
    </div>
  </div>

  <!-- Step 2 -->
  <div class="grid md:grid-cols-2 gap-8 items-center">
    <div class="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-8 h-64 flex items-center justify-center">
      <div class="text-center">
        <svg class="w-32 h-32 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <p class="mt-4 text-sm text-muted-foreground">Browse Events</p>
      </div>
    </div>
    <div>
      <div class="flex items-center gap-4 mb-4">
        <div class="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">2</div>
        <h2 class="text-3xl font-bold mb-0">Browse & Register for Events</h2>
      </div>
      <p class="text-lg">Explore our curated events - from speed dating to activity-based mixers. Choose events that match your interests and register with just a few clicks.</p>
      <ul class="mt-4">
        <li>Filter by date, location, and type</li>
        <li>Read event details and requirements</li>
        <li>Secure your spot with easy registration</li>
      </ul>
    </div>
  </div>

  <!-- Step 3 -->
  <div class="grid md:grid-cols-2 gap-8 items-center">
    <div class="order-2 md:order-1">
      <div class="flex items-center gap-4 mb-4">
        <div class="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">3</div>
        <h2 class="text-3xl font-bold mb-0">Attend & Connect</h2>
      </div>
      <p class="text-lg">Show up to the event and meet people in person! Our events are designed to break the ice and facilitate meaningful conversations in a fun, relaxed environment.</p>
      <ul class="mt-4">
        <li>Arrive at the venue on time</li>
        <li>Participate in structured activities</li>
        <li>Exchange contact info with matches</li>
      </ul>
    </div>
    <div class="order-1 md:order-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-8 h-64 flex items-center justify-center">
      <div class="text-center">
        <svg class="w-32 h-32 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <p class="mt-4 text-sm text-muted-foreground">Meet People</p>
      </div>
    </div>
  </div>

  <!-- Step 4 -->
  <div class="grid md:grid-cols-2 gap-8 items-center">
    <div class="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-8 h-64 flex items-center justify-center">
      <div class="text-center">
        <svg class="w-32 h-32 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
        <p class="mt-4 text-sm text-muted-foreground">Find Your Match</p>
      </div>
    </div>
    <div>
      <div class="flex items-center gap-4 mb-4">
        <div class="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">4</div>
        <h2 class="text-3xl font-bold mb-0">Get Matched & Follow Up</h2>
      </div>
      <p class="text-lg">After the event, our algorithm suggests potential matches based on mutual interest and compatibility. Connect through our platform and start your journey together!</p>
      <ul class="mt-4">
        <li>Receive match suggestions via email</li>
        <li>View compatibility scores</li>
        <li>Message your matches directly</li>
      </ul>
    </div>
  </div>
</div>
  ',
  secondary_content = '
<div class="text-center space-y-6">
  <h2>Ready to Get Started?</h2>
  <p class="text-xl">Join thousands of singles who have found meaningful connections through our events. Your perfect match could be at the next event!</p>
  <div class="flex flex-wrap gap-4 justify-center mt-8">
    <a href="/events" class="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">Browse Upcoming Events</a>
    <a href="/auth/sign-up" class="inline-block px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors">Create Free Account</a>
  </div>
  
  <div class="mt-12 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
    <div>
      <div class="text-4xl font-bold text-primary mb-2">10K+</div>
      <p class="text-muted-foreground">Active Members</p>
    </div>
    <div>
      <div class="text-4xl font-bold text-primary mb-2">500+</div>
      <p class="text-muted-foreground">Events Hosted</p>
    </div>
    <div>
      <div class="text-4xl font-bold text-primary mb-2">2K+</div>
      <p class="text-muted-foreground">Successful Matches</p>
    </div>
  </div>
</div>
  '
WHERE page_key = 'how_it_works';

-- Add comment
COMMENT ON COLUMN public.cms_content.content IS 'Main HTML content - fully customizable with HTML tags';
COMMENT ON COLUMN public.cms_content.subtitle IS 'Optional subtitle for hero banner';
COMMENT ON COLUMN public.cms_content.banner_image IS 'Optional hero banner background image URL';
COMMENT ON COLUMN public.cms_content.secondary_content IS 'Optional secondary HTML content section';
COMMENT ON COLUMN public.cms_content.additional_data IS 'JSONB field for additional flexible data';
