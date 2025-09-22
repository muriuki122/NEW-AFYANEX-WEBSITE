// Advanced AI Chatbot for Healthcare Website
class AfyaNexChatbot {
    constructor() {
        this.conversationHistory = [];
        this.userProfile = {
            name: null,
            lastIntent: null,
            conversationCount: 0,
            mood: 'neutral'
        };
        this.medicalKnowledge = this.initializeMedicalKnowledge();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        const chatbotToggler = document.querySelector('.chatbot-toggler');
        const chatbotContainer = document.querySelector('.chatbot-container');
        const closeChatbot = document.querySelector('.close-chatbot');
        const chatbotInput = document.querySelector('.chatbot-input input');
        const chatbotSendBtn = document.querySelector('.chatbot-input button');

        if (chatbotToggler && chatbotContainer) {
            chatbotToggler.addEventListener('click', () => {
                chatbotContainer.classList.toggle('active');
                if (chatbotContainer.classList.contains('active')) {
                    this.userProfile.conversationCount++;
                }
            });

            if (closeChatbot) {
                closeChatbot.addEventListener('click', () => {
                    chatbotContainer.classList.remove('active');
                });
            }

            if (chatbotSendBtn && chatbotInput) {
                chatbotSendBtn.addEventListener('click', () => this.processUserInput());
                chatbotInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.processUserInput();
                    }
                });
            }
        }
    }

    async processUserInput() {
        const chatbotInput = document.querySelector('.chatbot-input input');
        const userMessage = chatbotInput.value.trim();
        
        if (!userMessage) return;

        // Add user message to chat
        this.addMessageToChat(userMessage, true);
        chatbotInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.generateResponse(userMessage);
            this.hideTypingIndicator();
            this.addMessageToChat(response, false);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessageToChat("I apologize for the confusion. Could you please rephrase your question?", false);
        }
    }

    initializeMedicalKnowledge() {
        return {
            services: {
                outpatient: {
                    description: "General outpatient services including consultations, health screenings, and preventive care",
                    doctors: ["Dr. Jesse Gitaka", "Dr. Terry Kuria", "Dr. Sarah Nekesa"],
                    hours: "8:00 AM - 8:00 PM (Mon-Sat), 9:00 AM - 5:00 PM (Sun)",
                    cost: "Consultation fees start from KES 500"
                },
                laboratory: {
                    description: "Comprehensive diagnostic services including blood tests, urinalysis, and specialized tests",
                    tests: ["Blood Count", "Malaria Test", "Diabetes Screening", "HIV Testing", "Thyroid Function"],
                    turnaround: "Most results within 2-4 hours",
                    accuracy: "99.8% accuracy rate"
                },
                pharmacy: {
                    description: "Fully stocked pharmacy with genuine medications and professional counseling",
                    services: ["Prescription Dispensing", "OTC Medications", "Medical Supplies", "Health Supplements"],
                    availability: "24/7 emergency pharmacy services"
                },
                maternal: {
                    description: "Complete maternal and child healthcare services",
                    services: ["Antenatal Care", "Delivery Services", "Postnatal Care", "Child Immunization", "Family Planning"],
                    specialists: ["Gynecologists", "Pediatricians", "Midwives"]
                }
            },
            doctors: {
                "Dr. Jesse Gitaka": {
                    specialty: "CEO & Lead Physician",
                    experience: "15+ years in general medicine",
                    education: "MBChB, University of Nairobi",
                    availability: "Monday-Friday, 9AM-5PM"
                },
                "Dr. Terry Kuria": {
                    specialty: "Clinical Manager & Physician",
                    experience: "12 years in clinical practice",
                    education: "MBChB, MMed in Internal Medicine",
                    availability: "Monday-Saturday, 8AM-6PM"
                },
                "Dr. Sarah Nekesa": {
                    specialty: "General Practitioner",
                    experience: "8 years in family medicine",
                    education: "MBChB, Diploma in Child Health",
                    availability: "Tuesday-Sunday, 10AM-7PM"
                }
            },
            emergency: {
                contacts: ["0759 887 759", "Emergency Hotline: 0790 123 456"],
                procedures: [
                    "Call our emergency line immediately",
                    "Provide your location and condition",
                    "Our ambulance service available 24/7",
                    "First aid instructions available over phone"
                ]
            },
            healthTips: {
                general: [
                    "Drink 8 glasses of water daily",
                    "Exercise 30 minutes daily",
                    "Get 7-8 hours of sleep",
                    "Eat balanced diet with fruits and vegetables"
                ],
                prevention: [
                    "Wash hands regularly",
                    "Get annual check-ups",
                    "Vaccinate on schedule",
                    "Practice safe food handling"
                ]
            }
        };
    }

    async generateResponse(userMessage) {
        this.updateUserProfile(userMessage);
        const intent = this.analyzeIntent(userMessage);
        
        let response;
        
        switch (intent.category) {
            case 'greeting':
                response = this.handleGreeting();
                break;
            case 'appointment':
                response = this.handleAppointment(intent);
                break;
            case 'service_inquiry':
                response = this.handleServiceInquiry(intent);
                break;
            case 'doctor_info':
                response = this.handleDoctorInfo(intent);
                break;
            case 'medical_question':
                response = await this.handleMedicalQuestion(intent, userMessage);
                break;
            case 'emergency':
                response = this.handleEmergency();
                break;
            case 'location':
                response = this.handleLocation();
                break;
            case 'hours':
                response = this.handleOperatingHours();
                break;
            case 'cost':
                response = this.handleCostInquiry(intent);
                break;
            case 'feedback':
                response = this.handleFeedback(intent);
                break;
            case 'small_talk':
                response = this.handleSmallTalk(userMessage);
                break;
            case 'joke':
                response = this.handleJoke();
                break;
            default:
                response = this.handleUnknownQuery(userMessage);
        }

        this.conversationHistory.push({
            user: userMessage,
            bot: response,
            intent: intent,
            timestamp: new Date().toISOString()
        });

        return response;
    }

    analyzeIntent(message) {
        const lowerMessage = message.toLowerCase().trim();
        
        // Medical keywords with weights
        const medicalKeywords = {
            'appointment': 10, 'book': 8, 'schedule': 7,
            'doctor': 9, 'dr.': 8, 'physician': 7,
            'service': 8, 'treatment': 7, 'consult': 6,
            'emergency': 10, 'urgent': 9, 'help now': 10,
            'location': 6, 'address': 6, 'where': 5,
            'hour': 5, 'time': 4, 'open': 5,
            'cost': 6, 'price': 6, 'fee': 6,
            'pain': 8, 'fever': 8, 'headache': 7, 'cough': 7,
            'medicine': 6, 'prescription': 6, 'pharmacy': 6,
            'test': 6, 'lab': 6, 'result': 5,
            'thank': 3, 'feedback': 4, 'complain': 4,
            'hello': 2, 'hi': 2, 'hey': 2,
            'joke': 1, 'funny': 1, 'laugh': 1
        };

        let scores = {
            greeting: 0, appointment: 0, service_inquiry: 0,
            doctor_info: 0, medical_question: 0, emergency: 0,
            location: 0, hours: 0, cost: 0, feedback: 0,
            small_talk: 0, joke: 0
        };

        // Score based on keywords
        Object.keys(medicalKeywords).forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                if (keyword.includes('appointment') || keyword.includes('book')) scores.appointment += medicalKeywords[keyword];
                if (keyword.includes('doctor') || keyword.includes('dr.')) scores.doctor_info += medicalKeywords[keyword];
                if (keyword.includes('service') || keyword.includes('treatment')) scores.service_inquiry += medicalKeywords[keyword];
                if (keyword.includes('emergency') || keyword.includes('urgent')) scores.emergency += medicalKeywords[keyword];
                if (keyword.includes('location') || keyword.includes('address')) scores.location += medicalKeywords[keyword];
                if (keyword.includes('hour') || keyword.includes('time')) scores.hours += medicalKeywords[keyword];
                if (keyword.includes('cost') || keyword.includes('price')) scores.cost += medicalKeywords[keyword];
                if (keyword.includes('pain') || keyword.includes('fever')) scores.medical_question += medicalKeywords[keyword];
                if (keyword.includes('thank') || keyword.includes('feedback')) scores.feedback += medicalKeywords[keyword];
                if (keyword.includes('hello') || keyword.includes('hi')) scores.greeting += medicalKeywords[keyword];
                if (keyword.includes('joke') || keyword.includes('funny')) scores.joke += medicalKeywords[keyword];
            }
        });

        // Additional context-based scoring
        if (lowerMessage.includes('?')) {
            if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('when')) {
                scores.medical_question += 3;
            }
        }

        if (this.userProfile.lastIntent === 'greeting' && scores.greeting > 0) {
            scores.greeting += 5; // Boost greeting score if we just greeted
        }

        // Find highest scoring intent
        let maxScore = 0;
        let detectedIntent = 'small_talk';
        
        Object.keys(scores).forEach(intent => {
            if (scores[intent] > maxScore) {
                maxScore = scores[intent];
                detectedIntent = intent;
            }
        });

        // Extract entities
        const entities = this.extractEntities(message, detectedIntent);

        return {
            category: detectedIntent,
            confidence: maxScore,
            entities: entities,
            originalMessage: message
        };
    }

    extractEntities(message, intent) {
        const entities = {};
        const lowerMessage = message.toLowerCase();

        switch (intent) {
            case 'service_inquiry':
                if (lowerMessage.includes('lab') || lowerMessage.includes('test')) entities.service = 'laboratory';
                if (lowerMessage.includes('pharmacy') || lowerMessage.includes('medicine')) entities.service = 'pharmacy';
                if (lowerMessage.includes('maternal') || lowerMessage.includes('child')) entities.service = 'maternal';
                if (lowerMessage.includes('general') || lowerMessage.includes('outpatient')) entities.service = 'outpatient';
                break;
                
            case 'doctor_info':
                if (lowerMessage.includes('gitaka')) entities.doctor = 'Dr. Jesse Gitaka';
                if (lowerMessage.includes('kuria')) entities.doctor = 'Dr. Terry Kuria';
                if (lowerMessage.includes('nekesa') || lowerMessage.includes('sarah')) entities.doctor = 'Dr. Sarah Nekesa';
                break;
                
            case 'medical_question':
                const symptoms = ['fever', 'pain', 'headache', 'cough', 'cold', 'vomit', 'dizzy', 'rash'];
                entities.symptoms = symptoms.filter(symptom => lowerMessage.includes(symptom));
                break;
        }

        return entities;
    }

    updateUserProfile(message) {
        this.userProfile.conversationCount++;
        
        // Extract name if mentioned
        const nameMatch = message.match(/(?:my name is|i am|call me) ([a-zA-Z]{2,})/i);
        if (nameMatch && !this.userProfile.name) {
            this.userProfile.name = nameMatch[1];
        }

        // Detect mood from message
        const positiveWords = ['good', 'great', 'excellent', 'happy', 'well', 'thanks', 'thank you'];
        const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'angry', 'frustrated', 'hurt'];
        
        if (positiveWords.some(word => message.toLowerCase().includes(word))) {
            this.userProfile.mood = 'positive';
        } else if (negativeWords.some(word => message.toLowerCase().includes(word))) {
            this.userProfile.mood = 'negative';
        }
    }

    handleGreeting() {
        const greetings = [
            `Hello${this.userProfile.name ? ' ' + this.userProfile.name : ''}! 👋 I'm AfyaNex AI Assistant. How can I help you today?`,
            `Hi there! 🏥 Welcome to AfyaNex Healthcare. What can I assist you with?`,
            `Greetings! 😊 I'm here to help with appointments, medical information, and healthcare services. How can I assist you?`
        ];
        
        this.userProfile.lastIntent = 'greeting';
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    handleAppointment(intent) {
        this.userProfile.lastIntent = 'appointment';
        
        return `**Booking an Appointment at AfyaNex** 📅\n\n` +
               `To schedule your appointment:\n\n` +
               `📞 **Call**: 0759 887 759\n` +
               `📍 **Visit**: Muteremko, Bungoma Opp Slaughter House\n` +
               `⏰ **Hours**: 8:00 AM - 8:00 PM (Mon-Sat), 9:00 AM - 5:00 PM (Sun)\n\n` +
               `**Our Doctors**:\n` +
               `• Dr. Jesse Gitaka (CEO & Lead Physician)\n` +
               `• Dr. Terry Kuria (Clinical Manager)\n` +
               `• Dr. Sarah Nekesa (General Practitioner)\n\n` +
               `Would you like information about a specific service?`;
    }

    handleServiceInquiry(intent) {
        const service = intent.entities.service;
        const serviceInfo = this.medicalKnowledge.services[service] || this.medicalKnowledge.services.outpatient;
        
        this.userProfile.lastIntent = 'service_inquiry';
        
        if (service) {
            return `**${service.charAt(0).toUpperCase() + service.slice(1)} Services at AfyaNex**\n\n` +
                   `${serviceInfo.description}\n\n` +
                   `**Key Features**:\n` +
                   `• ${Object.values(serviceInfo).filter(val => Array.isArray(val)).flat().slice(0, 3).join('\n• ')}\n\n` +
                   `For more details or to schedule, call us at 0759 887 759`;
        }
        
        return `**AfyaNex Healthcare Services** 🏥\n\n` +
               `We offer comprehensive medical services:\n\n` +
               `• **General Outpatient Care** - Consultations & health screenings\n` +
               `• **Diagnostic Laboratory** - Accurate testing & results\n` +
               `• **Pharmaceutical Services** - Medications & counseling\n` +
               `• **Maternal & Child Health** - Complete family care\n\n` +
               `Which service are you interested in learning more about?`;
    }

    handleDoctorInfo(intent) {
        const doctorName = intent.entities.doctor || 'Dr. Jesse Gitaka';
        const doctorInfo = this.medicalKnowledge.doctors[doctorName];
        
        this.userProfile.lastIntent = 'doctor_info';
        
        if (doctorInfo) {
            return `**${doctorName}** 👨‍⚕️👩‍⚕️\n\n` +
                   `**Specialty**: ${doctorInfo.specialty}\n` +
                   `**Experience**: ${doctorInfo.experience}\n` +
                   `**Education**: ${doctorInfo.education}\n` +
                   `**Availability**: ${doctorInfo.availability}\n\n` +
                   `To book an appointment with ${doctorName.split(' ')[1]}, call 0759 887 759`;
        }
        
        return `**Our Medical Team** 👥\n\n` +
               `AfyaNex has experienced healthcare professionals:\n\n` +
               `• **Dr. Jesse Gitaka** - CEO & Lead Physician (15+ years)\n` +
               `• **Dr. Terry Kuria** - Clinical Manager (12 years)\n` +
               `• **Dr. Sarah Nekesa** - General Practitioner (8 years)\n\n` +
               `Which doctor would you like to know more about?`;
    }

    async handleMedicalQuestion(intent, originalMessage) {
        this.userProfile.lastIntent = 'medical_question';
        
        // Important medical disclaimer
        const disclaimer = `\n\n⚠️ **Medical Disclaimer**: I'm an AI assistant and cannot provide medical diagnoses. Please consult our healthcare professionals for personal medical advice.`;
        
        // General health information based on symptoms mentioned
        if (intent.entities.symptoms && intent.entities.symptoms.length > 0) {
            const symptomAdvice = {
                'fever': `For fever management: Rest, stay hydrated, and monitor temperature. If above 38.5°C or lasting more than 3 days, see a doctor.`,
                'pain': `For pain management: Rest the affected area. Persistent or severe pain requires medical evaluation.`,
                'headache': `For headaches: Ensure hydration, rest in quiet environment. Severe or frequent headaches need medical attention.`,
                'cough': `For cough: Stay hydrated, avoid irritants. If accompanied by fever or breathing difficulty, seek care.`
            };
            
            const advice = intent.entities.symptoms.map(symptom => 
                symptomAdvice[symptom] || `For ${symptom}: Please consult with our doctors for proper evaluation.`
            ).join('\n\n');
            
            return advice + disclaimer;
        }
        
        return `I understand you have a health question. Our healthcare professionals at AfyaNex can provide accurate medical advice based on proper examination.` + 
               `\n\nCall us at 0759 887 759 to speak with a doctor or visit our facility for comprehensive care.` + disclaimer;
    }

    handleEmergency() {
        this.userProfile.lastIntent = 'emergency';
        
        return `🚨 **EMERGENCY MEDICAL ASSISTANCE** 🚨\n\n` +
               `**IMMEDIATE ACTION REQUIRED:**\n\n` +
               `📞 **Call Emergency**: 0759 887 759\n` +
               `📍 **Location**: Muteremko, Bungoma Opp Slaughter House\n` +
               `⏰ **24/7 Emergency Services Available**\n\n` +
               `**For Life-Threatening Emergencies:**\n` +
               `• Call our emergency line immediately\n` +
               `• Provide your location and condition\n` +
               `• Follow instructions from our medical team\n` +
               `• Ambulance service available when needed\n\n` +
               `**Do not delay seeking medical attention for serious conditions!**`;
    }

    handleLocation() {
        return `**AfyaNex Healthcare Location** 📍\n\n` +
               `We are located at:\n\n` +
               `**Muteremko, Bungoma**\n` +
               `Opposite Slaughter House\n` +
               `Bungoma County, Kenya\n\n` +
               `**Landmarks**: Near the main market, opposite the slaughterhouse facility\n` +
               `**Accessibility**: Easy access by public transport and private vehicles\n\n` +
               `Call us for directions: 0759 887 759`;
    }

    handleOperatingHours() {
        return `**AfyaNex Operating Hours** ⏰\n\n` +
               `**Regular Consultation Hours**:\n` +
               `• Monday - Saturday: 8:00 AM - 8:00 PM\n` +
               `• Sunday: 9:00 AM - 5:00 PM\n\n` +
               `**24/7 Services Available**:\n` +
               `• Emergency Medical Care\n` +
               `• Emergency Pharmacy\n` +
               `• Ambulance Services\n\n` +
               `**Laboratory Services**:\n` +
               `• Monday - Saturday: 7:00 AM - 7:00 PM\n` +
               `• Sunday: 8:00 AM - 4:00 PM\n\n` +
               `We're here when you need us!`;
    }

    handleCostInquiry(intent) {
        return `**AfyaNex Service Costs** 💰\n\n` +
               `Our services are affordable and transparent:\n\n` +
               `• **General Consultation**: Starting from KES 500\n` +
               `• **Laboratory Tests**: KES 200 - KES 2,000 (depending on test)\n` +
               `• **Emergency Services**: Case-by-case basis\n` +
               `• **Maternal Services**: Comprehensive packages available\n\n` +
               `**We accept**: Cash, M-Pesa, and Insurance (subject to approval)\n\n` +
               `For specific pricing, please call us at 0759 887 759 or visit our facility for accurate quotations.`;
    }

    handleFeedback(intent) {
        return `**Feedback & Complaints** 💬\n\n` +
               `We value your feedback to improve our services:\n\n` +
               `📞 **Call**: 0759 887 759\n` +
               `📧 **Email**: feedback@afyanex.com\n` +
               `📍 **Visit**: Speak with our patient relations desk\n\n` +
               `Your satisfaction is important to us!`;
    }

    handleSmallTalk(message) {
        const responses = {
            'how are you': `I'm functioning well, thank you! 😊 Ready to help you with healthcare services. How can I assist you today?`,
            'your name': `I'm the AfyaNex AI Assistant! I'm here to help you with medical information, appointments, and healthcare services.`,
            'weather': `I don't have weather updates, but I recommend dressing appropriately for your health! 🌞🌧️`,
            'thank you': `You're welcome! ${this.userProfile.name ? this.userProfile.name + ',' : ''} Is there anything else I can help you with?`,
            'goodbye': `Thank you for visiting AfyaNex! Remember we're here for your healthcare needs. Stay healthy! 👋`
        };

        for (const [key, response] of Object.entries(responses)) {
            if (message.toLowerCase().includes(key)) {
                return response;
            }
        }

        return `I'm here to help with AfyaNex healthcare services! Would you like information about:\n\n` +
               `• Booking an appointment\n` +
               `• Our medical services\n` +
               `• Doctor information\n` +
               `• Location and hours\n` +
               `• Or something else?`;
    }

    handleJoke() {
        const medicalJokes = [
            "Why did the doctor carry a red pen? In case they needed to draw blood! 😄",
            "What's a doctor's favorite type of music? Wrap! 🎵",
            "Why are doctors so good at solving problems? They have the best prescriptions! 💊",
            "Why did the nurse have a ruler? To see how long the patient's temperature would stay down! 📏"
        ];

        return medicalJokes[Math.floor(Math.random() * medicalJokes.length)] + 
               `\n\nNeed medical assistance or more information about our services?`;
    }

    handleUnknownQuery(message) {
        return `I appreciate your question! While I'm trained to help with AfyaNex healthcare services, ` +
               `some questions are best answered by our human staff.\n\n` +
               `Please call us at 0759 887 759 for detailed assistance, or ask me about:\n\n` +
               `• Medical appointments\n` +
               `• Our healthcare services\n` +
               `• Doctor information\n` +
               `• Location and operating hours`;
    }

    // UI Methods
    addMessageToChat(message, isUser) {
        const chatbotMessages = document.querySelector('.chatbot-messages');
        if (!chatbotMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        
        const messageP = document.createElement('p');
        messageP.innerHTML = message.replace(/\n/g, '<br>');
        
        messageDiv.appendChild(messageP);
        chatbotMessages.appendChild(messageDiv);
        
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    showTypingIndicator() {
        const chatbotMessages = document.querySelector('.chatbot-messages');
        if (!chatbotMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message', 'typing');
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `<p>AfyaNex AI is typing<span class="typing-dots">...</span></p>`;
        
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.addMessageToChat(
                `Welcome to AfyaNex Healthcare! 🏥\n\nI'm your AI assistant. I can help you with:\n\n` +
                `• Booking appointments\n• Service information\n• Doctor details\n• Medical queries\n• Location & hours\n\n` +
                `How can I assist you today?`, 
                false
            );
        }, 1000);
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the advanced chatbot
    window.afyaNexChatbot = new AfyaNexChatbot();

    // Add typing animation styles
    if (!document.querySelector('#chatbot-styles')) {
        const styles = document.createElement('style');
        styles.id = 'chatbot-styles';
        styles.textContent = `
            .typing .typing-dots {
                display: inline-block;
                animation: typingPulse 1.5s infinite;
            }
            @keyframes typingPulse {
                0%, 60% { opacity: 1; }
                61%, 100% { opacity: 0.3; }
            }
        `;
        document.head.appendChild(styles);
    }
});

// Mobile Menu Toggle (existing code)
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav');

if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });

    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });
}

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.padding = '10px 0';
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.padding = '15px 0';
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    }
});


// Inject styles if not already present
if (!document.querySelector('#chatbot-typing-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'chatbot-typing-styles';
    styleSheet.textContent = typingStyles;
    document.head.appendChild(styleSheet);
}

// Animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.service-card, .team-member, .testimonial');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = 1;
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initialize elements for animation
document.querySelectorAll('.service-card, .team-member, .testimonial').forEach(element => {
    element.style.opacity = 0;
    element.style.transform = 'translateY(50px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// Listen for scroll events
window.addEventListener('scroll', animateOnScroll);

// Initial check on page load
window.addEventListener('load', animateOnScroll);

// Health Library JavaScript

document.addEventListener('DOMContentLoaded'), function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.health-library-header nav ul');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }}
    
 // Health Library JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.health-library-header nav ul');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }
    
    // Condition data
    const conditionsData = {
        malaria: {
            title: "Malaria",
            severity: "Moderate",
            content: `
                <h3>Overview</h3>
                <p>Malaria is a serious and sometimes fatal disease caused by a parasite that commonly infects a certain type of mosquito which feeds on humans. People who get malaria are typically very sick with high fevers, shaking chills, and flu-like illness.</p>
                
                <h3>Symptoms</h3>
                <ul>
                    <li>Fever and chills</li>
                    <li>Headache and body aches</li>
                    <li>Fatigue and weakness</li>
                    <li>Nausea and vomiting</li>
                    <li>Abdominal pain</li>
                    <li>Muscle or joint pain</li>
                </ul>
                
                <h3>Prevention</h3>
                <ul>
                    <li>Use insecticide-treated mosquito nets</li>
                    <li>Apply mosquito repellent to exposed skin</li>
                    <li>Wear long-sleeved clothing, especially after dusk</li>
                    <li>Use screens on windows and doors</li>
                    <li>Take antimalarial medication when traveling to high-risk areas</li>
                </ul>
                
                <h3>Treatment at Afyanex</h3>
                <p>We provide rapid diagnostic testing to confirm malaria infection. Based on the results, our doctors will prescribe the appropriate antimalarial medication. Treatment depends on the type of malaria, severity of symptoms, and patient's age and pregnancy status.</p>
                
                <div class="warning-note">
                    <h4>When to Seek Immediate Care</h4>
                    <p>Seek emergency medical attention if you experience:</p>
                    <ul>
                        <li>High fever that doesn't respond to medication</li>
                        <li>Severe headache with confusion</li>
                        <li>Seizures or convulsions</li>
                        <li>Difficulty breathing</li>
                        <li>Yellowing of skin or eyes (jaundice)</li>
                    </ul>
                </div>
            `
        },
        hypertension: {
            title: "Hypertension (High Blood Pressure)",
            severity: "Serious",
            content: `
                <h3>Overview</h3>
                <p>Hypertension, or high blood pressure, is a common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease.</p>
                
                <h3>Symptoms</h3>
                <p>Hypertension is often called the "silent killer" because it typically has no symptoms until significant damage has been done. When symptoms do occur, they may include:</p>
                <ul>
                    <li>Headaches</li>
                    <li>Shortness of breath</li>
                    <li>Nosebleeds (rare)</li>
                    <li>Flushing</li>
                    <li>Dizziness</li>
                    <li>Chest pain</li>
                    <li>Visual changes</li>
                </ul>
                
                <h3>Risk Factors</h3>
                <ul>
                    <li>Age (risk increases as you get older)</li>
                    <li>Family history of hypertension</li>
                    <li>Being overweight or obese</li>
                    <li>Not being physically active</li>
                    <li>Using tobacco</li>
                    <li>Too much salt in the diet</li>
                    <li>Too little potassium in the diet</li>
                    <li>Drinking too much alcohol</li>
                    <li>Stress</li>
                </ul>
                
                <h3>Treatment at Afyanex</h3>
                <p>Our approach to hypertension management includes:</p>
                <ul>
                    <li>Accurate blood pressure monitoring</li>
                    <li>Lifestyle modification counseling</li>
                    <li>Appropriate medication when needed</li>
                    <li>Regular follow-up to adjust treatment</li>
                    <li>Screening for complications</li>
                </ul>
                
                <div class="warning-note">
                    <h4>Hypertensive Emergency</h4>
                    <p>Seek immediate medical care if your blood pressure is extremely high (180/120 mm Hg or higher) and you have symptoms such as:</p>
                    <ul>
                        <li>Severe headache</li>
                        <li>Chest pain</li>
                        <li>Numbness or weakness</li>
                        <li>Vision changes</li>
                        <li>Difficulty breathing</li>
                    </ul>
                </div>
            `
        },
        diabetes: {
            title: "Diabetes",
            severity: "Serious",
            content: `
                <h3>Overview</h3>
                <p>Diabetes is a chronic disease that occurs when the pancreas is no longer able to make insulin, or when the body cannot make good use of the insulin it produces. There are three main types of diabetes: Type 1, Type 2, and gestational diabetes.</p>
                
                <h3>Symptoms</h3>
                <ul>
                    <li>Increased thirst and hunger</li>
                    <li>Frequent urination</li>
                    <li>Unexplained weight loss</li>
                    <li>Fatigue</li>
                    <li>Blurred vision</li>
                    <li>Slow-healing sores</li>
                    <li>Frequent infections</li>
                </ul>
                
                <h3>Complications</h3>
                <p>If not properly managed, diabetes can lead to serious complications including:</p>
                <ul>
                    <li>Heart disease and stroke</li>
                    <li>Kidney damage (nephropathy)</li>
                    <li>Eye damage (retinopathy)</li>
                    <li>Nerve damage (neuropathy)</li>
                    <li>Foot problems that can lead to amputation</li>
                    <li>Skin conditions</li>
                </ul>
                
                <h3>Treatment at Afyanex</h3>
                <p>Our comprehensive diabetes care includes:</p>
                <ul>
                    <li>Blood glucose monitoring</li>
                    <li>Medication management (oral medications or insulin)</li>
                    <li>Nutritional counseling</li>
                    <li>Exercise recommendations</li>
                    <li>Regular screening for complications</li>
                    <li>Education on self-management</li>
                </ul>
                
                <div class="warning-note">
                    <h4>Diabetic Emergency</h4>
                    <p>Seek immediate medical attention if you experience symptoms of very high or very low blood sugar:</p>
                    <ul>
                        <li>Confusion or unusual behavior</li>
                        <li>Fruity-smelling breath</li>
                        <li>Nausea and vomiting</li>
                        <li>Shortness of breath</li>
                        <li>Dry mouth</li>
                        <li>Weakness or fainting</li>
                    </ul>
                </div>
            `
        },
        respiratory: {
            title: "Respiratory Infections",
            severity: "Mild-Moderate",
            content: `
                <h3>Overview</h3>
                <p>Respiratory infections affect the parts of the body involved in breathing, such as the sinuses, throat, airways, or lungs. They can be caused by viruses or bacteria and range from mild (like the common cold) to severe (like pneumonia).</p>
                
                <h3>Common Types</h3>
                <ul>
                    <li>Common cold</li>
                    <li>Influenza (flu)</li>
                    <li>Bronchitis</li>
                    <li>Pneumonia</li>
                    <li>Sinusitis</li>
                    <li>Tonsillitis</li>
                </ul>
                
                <h3>Symptoms</h3>
                <ul>
                    <li>Cough (dry or productive)</li>
                    <li>Sore throat</li>
                    <li>Runny or stuffy nose</li>
                    <li>Fever</li>
                    <li>Shortness of breath</li>
                    <li>Body aches</li>
                    <li>Fatigue</li>
                </ul>
                
                <h3>Prevention</h3>
                <ul>
                    <li>Frequent hand washing</li>
                    <li>Avoiding close contact with sick people</li>
                    <li>Covering mouth and nose when coughing or sneezing</li>
                    <li>Staying home when sick</li>
                    <li>Getting vaccinated (flu vaccine, pneumonia vaccine)</li>
                </ul>
                
                <h3>Treatment at Afyanex</h3>
                <p>We provide accurate diagnosis and appropriate treatment for respiratory infections:</p>
                <ul>
                    <li>Physical examination</li>
                    <li>Laboratory tests when needed</li>
                    <li>Appropriate antibiotics for bacterial infections</li>
                    <li>Symptomatic relief medications</li>
                    <li>Referral for chest X-ray if pneumonia is suspected</li>
                </ul>
                
                <div class="warning-note">
                    <h4>When to Seek Immediate Care</h4>
                    <p>Seek emergency medical attention if you experience:</p>
                    <ul>
                        <li>Difficulty breathing or shortness of breath</li>
                        <li>High fever that doesn't respond to medication</li>
                        <li>Chest pain</li>
                        <li>Confusion or disorientation</li>
                        <li>Bluish lips or face</li>
                    </ul>
                </div>
            `
        },
        uti: {
            title: "Urinary Tract Infection (UTI)",
            severity: "Moderate",
            content: `
                <h3>Overview</h3>
                <p>A urinary tract infection (UTI) is an infection in any part of the urinary system — kidneys, ureters, bladder, and urethra. Most infections involve the lower urinary tract — the bladder and the urethra.</p>
                
                <h3>Symptoms</h3>
                <ul>
                    <li>Burning sensation when urinating</li>
                    <li>Frequent or intense urge to urinate</li>
                    <li>Cloudy, dark, bloody, or strange-smelling urine</li>
                    <li>Pain or pressure in the lower abdomen or back</li>
                    <li>Feeling tired or shaky</li>
                    <li>Fever or chills (a sign the infection may have reached the kidneys)</li>
                </ul>
                
                <h3>Risk Factors</h3>
                <ul>
                    <li>Female anatomy (shorter urethra)</li>
                    <li>Sexual activity</li>
                    <li>Certain types of birth control</li>
                    <li>Menopause</li>
                    <li>Urinary tract abnormalities</li>
                    <li>Blockages in the urinary tract</li>
                    <li>Suppressed immune system</li>
                </ul>
                
                <h3>Prevention</h3>
                <ul>
                    <li>Drink plenty of water</li>
                    <li>Wipe from front to back</li>
                    <li>Empty your bladder soon after intercourse</li>
                    <li>Avoid potentially irritating feminine products</li>
                    <li>Change your birth control method if needed</li>
                </ul>
                
                <h3>Treatment at Afyanex</h3>
                <p>We provide comprehensive UTI care including:</p>
                <ul>
                    <li>Urine analysis and culture</li>
                    <li>Appropriate antibiotic therapy</li>
                    <li>Pain relief medications</li>
                    <li>Follow-up to ensure complete resolution</li>
                    <li>Prevention strategies for recurrent UTIs</li>
                </ul>
                
                <div class="warning-note">
                    <h4>When to Seek Immediate Care</h4>
                    <p>Seek emergency medical attention if you experience symptoms of a kidney infection:</p>
                    <ul>
                        <li>High fever</li>
                        <li>Shaking chills</li>
                        <li>Pain in your back or side</li>
                        <li>Nausea and vomiting</li>
                    </ul>
                </div>
            `
        },
        gi: {
            title: "Gastrointestinal Issues",
            severity: "Mild-Serious",
            content: `
                <h3>Overview</h3>
                <p>Gastrointestinal (GI) issues refer to disorders of the digestive system, which includes the esophagus, stomach, small intestine, large intestine, rectum, liver, gallbladder, and pancreas. These conditions can range from mild indigestion to serious diseases.</p>
                
                <h3>Common Conditions</h3>
                <ul>
                    <li>Gastroesophageal reflux disease (GERD)</li>
                    <li>Peptic ulcers</li>
                    <li>Irritable bowel syndrome (IBS)</li>
                    <li>Inflammatory bowel disease (IBD)</li>
                    <li>Gallstones</li>
                    <li>Celiac disease</li>
                    <li>Food intolerances</li>
                </ul>
                
                <h3>Symptoms</h3>
                <ul>
                    <li>Abdominal pain or cramps</li>
                    <li>Bloating</li>
                    <li>Gas</li>
                    <li>Diarrhea or constipation</li>
                    <li>Nausea and vomiting</li>
                    <li>Heartburn</li>
                    <li>Loss of appetite</li>
                </ul>
                
                <h3>When to See a Doctor</h3>
                <p>Most GI issues are not serious, but you should consult a doctor if you experience:</p>
                <ul>
                    <li>Symptoms that persist for more than a few days</li>
                    <li>Unexplained weight loss</li>
                    <li>Severe abdominal pain</li>
                    <li>Blood in stool or vomit</li>
                    <li>Difficulty swallowing</li>
                    <li>Yellowing of skin or eyes</li>
                </ul>
                
                <h3>Treatment at Afyanex</h3>
                <p>We provide comprehensive evaluation and management of GI issues:</p>
                <ul>
                    <li>Thorough history and physical examination</li>
                    <li>Appropriate laboratory testing</li>
                    <li>Medication management</li>
                    <li>Dietary recommendations</li>
                    <li>Referral for specialized tests when needed</li>
                </ul>
                
                <div class="warning-note">
                    <h4>Emergency Symptoms</h4>
                    <p>Seek immediate medical attention if you experience:</p>
                    <ul>
                        <li>Severe, sudden abdominal pain</li>
                        <li>Vomiting blood or material that looks like coffee grounds</li>
                        <li>Bloody or black, tarry stools</li>
                        <li>Inability to pass stool accompanied by vomiting</li>
                        <li>Abdominal pain with fever</li>
                    </ul>
                </div>
            `
        }
    };
    
    // Condition modal functionality
    const conditionModal = document.getElementById('conditionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMeta = document.getElementById('modalMeta');
    const modalBody = document.getElementById('modalBody');
    const closeModalButtons = document.querySelectorAll('.close-modal, #closeConditionModal');
    
    // More info button click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-info')) {
            const condition = e.target.getAttribute('data-condition');
            const conditionData = conditionsData[condition];
            
            if (conditionData) {
                modalTitle.textContent = conditionData.title;
                modalMeta.textContent = `Severity: ${conditionData.severity}`;
                modalBody.innerHTML = conditionData.content;
                conditionModal.style.display = 'flex';
            }
        }
    });
    
    // Close modal
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            conditionModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === conditionModal) {
            conditionModal.style.display = 'none';
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('healthSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query) {
            // Filter conditions based on search query
            const filteredConditions = Object.keys(conditionsData).filter(key => 
                conditionsData[key].title.toLowerCase().includes(query) || 
                conditionsData[key].content.toLowerCase().includes(query)
            );
            
            if (filteredConditions.length > 0) {
                // Scroll to conditions section
                document.querySelector('.common-conditions').scrollIntoView({ behavior: 'smooth' });
                
                // Highlight matching conditions
                document.querySelectorAll('.condition-card').forEach(card => {
                    const conditionName = card.querySelector('h3').textContent.toLowerCase();
                    if (filteredConditions.some(key => conditionsData[key].title.toLowerCase() === conditionName)) {
                        card.style.boxShadow = '0 0 0 3px #007bff';
                        setTimeout(() => {
                            card.style.boxShadow = '';
                        }, 3000);
                    }
                });
            } else {
                alert('No conditions found matching your search. Try different keywords.');
            }
        }
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Category filtering
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Scroll to conditions section
            document.querySelector('.common-conditions').scrollIntoView({ behavior: 'smooth' });
            
            // Map category to conditions
            const categoryMap = {
                'general': ['hypertension', 'diabetes'],
                'infectious': ['malaria', 'respiratory', 'uti'],
                'chronic': ['hypertension', 'diabetes'],
                'maternal': [],
                'prevention': [],
                'nutrition': ['gi']
            };
            
            const conditionsInCategory = categoryMap[category] || [];
            
            // Highlight conditions in the category
            document.querySelectorAll('.condition-card').forEach(card => {
                const conditionName = card.querySelector('h3').textContent.toLowerCase();
                if (conditionsInCategory.some(key => conditionsData[key].title.toLowerCase() === conditionName)) {
                    card.style.boxShadow = '0 0 0 3px #007bff';
                    setTimeout(() => {
                        card.style.boxShadow = '';
                    }, 3000);
                }
            });
        });
    });
});  