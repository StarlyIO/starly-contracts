pub contract TestingUtilities {
   pub var timestamp: UFix64
  
   pub fun addSeconds(_ seconds: UFix64) {
       self.timestamp = self.timestamp + seconds
   }

   init() {
       self.timestamp = 0.0;
   }
}