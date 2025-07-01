CREATE TABLE `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `submission_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `destinations`
--
CREATE TABLE `destinations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `destinations` with local image paths
--
INSERT INTO `destinations` (`id`, `name`, `description`, `image_url`, `price`) VALUES
(1, 'Santorini, Greece', 'Breathtaking sunsets and iconic white-washed villages overlooking the Aegean Sea.', 'images/santorini.jpg', 1500),
(2, 'Kyoto, Japan', 'Serene temples, vibrant shrines, and traditional geishas in Japan’s former imperial capital.', 'images/kyoto.jpg', 2200),
(3, 'Patagonia, Chile', 'Hike through dramatic mountain peaks, pristine glaciers, and impossibly blue lakes.', 'images/patagonia.jpg', 2800),
(4, 'Bora Bora, French Polynesia', 'Luxurious overwater bungalows surrounded by a turquoise lagoon and lush volcanic peaks.', 'images/borabora.jpg', 3500),
(5, 'Amalfi Coast, Italy', 'A stunning coastline with picturesque towns, terraced vineyards, and cliffside lemon groves.', 'images/amalfi.jpg', 1800),
(6, 'Zermatt, Switzerland', 'Iconic alpine adventures at the foot of the Matterhorn, with world-class skiing and hiking.', 'images/zermatt.jpg', 3100);

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--
CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `destination_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `travel_date` date NOT NULL,
  `travelers` int(11) NOT NULL,
  `booking_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
