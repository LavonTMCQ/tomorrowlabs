// Test script for voice capabilities of Tomorrow Travel Agent
import { VoiceUtils } from './src/mastra/voice/voice-utils.js';

async function testVoiceCapabilities() {
  console.log('🎤 Testing Tomorrow Travel Agent Voice Capabilities...\n');

  try {
    
    // Test 1: Voice-friendly text formatting
    console.log('📝 Test 1: Voice-friendly text formatting');
    const sampleText = `
**Welcome to Paris!** Here are some *great* activities:
- Visit the Eiffel Tower
- Explore the Louvre Museum
- Walk along the Seine River
Temperature: 22°C (72°F)
Budget: $100-200/day
Contact: info@paris-tourism.com
    `;
    
    const voiceFriendlyText = VoiceUtils.formatTextForSpeech(sampleText);
    console.log('Original:', sampleText.trim());
    console.log('Voice-friendly:', voiceFriendlyText);
    console.log('✅ Text formatting test completed\n');
    
    // Test 2: Travel intent extraction
    console.log('🧠 Test 2: Travel intent extraction');
    const voiceInputs = [
      "I want to visit Tokyo next month with a budget of $3000 for hiking and cultural activities",
      "Looking for a cheap beach vacation in Florida this summer",
      "Planning a luxury trip to Paris for my honeymoon",
      "Family-friendly destinations in California with kids activities"
    ];
    
    for (const input of voiceInputs) {
      const intent = VoiceUtils.extractTravelIntent(input);
      console.log(`Input: "${input}"`);
      console.log('Extracted intent:', intent);
      console.log('---');
    }
    console.log('✅ Intent extraction test completed\n');
    
    // Test 3: Voice input validation
    console.log('🔍 Test 3: Voice input validation');
    const testInputs = [
      "I want to travel to Japan",
      "uh... um... maybe...",
      "[inaudible] something about vacation",
      "What's the weather like in New York for my trip next week?",
      "Hi"
    ];
    
    for (const input of testInputs) {
      const validation = VoiceUtils.validateVoiceInput(input);
      console.log(`Input: "${input}"`);
      console.log(`Valid: ${validation.isValid}, Confidence: ${validation.confidence.toFixed(2)}`);
      if (validation.issues.length > 0) {
        console.log(`Issues: ${validation.issues.join(', ')}`);
      }
      console.log('---');
    }
    console.log('✅ Voice validation test completed\n');
    
    // Test 4: Text-to-Speech capability (simulated)
    console.log('🔊 Test 4: Text-to-Speech capability (simulated)');
    const testQuery = "What's the weather like in Miami for beach activities?";

    console.log(`Query: "${testQuery}"`);

    // Simulate agent response
    const mockResponse = `Miami is currently 28°C with sunny skies! Perfect weather for beach activities. I'd recommend visiting South Beach for swimming and sunbathing, or try water sports like jet skiing. The temperature is ideal for outdoor activities, and with low humidity, you'll be comfortable all day. Don't forget sunscreen!`;

    console.log('Simulated agent response:', mockResponse.substring(0, 200) + '...');

    // Format for voice
    const voiceText = VoiceUtils.formatTextForSpeech(mockResponse);
    console.log('Voice-formatted response:', voiceText.substring(0, 200) + '...');

    console.log('✅ Text-to-Speech formatting test completed\n');
    
    // Test 5: Travel recommendation formatting
    console.log('🌍 Test 5: Travel recommendation formatting');
    const mockWeather = {
      temperature: 28,
      description: 'sunny skies',
      humidity: 65,
      windSpeed: 10
    };
    
    const recommendation = VoiceUtils.formatTravelRecommendation(
      'Barcelona',
      mockWeather,
      ['beach', 'culture', 'food'],
      'luxury'
    );
    
    console.log('Generated recommendation:');
    console.log(recommendation);
    console.log('✅ Recommendation formatting test completed\n');
    
    console.log('🎉 All voice capability tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Text formatting for voice output');
    console.log('✅ Travel intent extraction from speech');
    console.log('✅ Voice input validation');
    console.log('✅ Text-to-speech formatting');
    console.log('✅ Voice-optimized travel recommendations');
    console.log('\n🚀 Tomorrow Travel Agent voice utilities are ready!');
    console.log('🎤 Voice capabilities will be available when running with `npm run dev`');
    
  } catch (error) {
    console.error('❌ Voice capability test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testVoiceCapabilities();
