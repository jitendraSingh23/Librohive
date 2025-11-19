import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.$transaction([
    prisma.follow.deleteMany(),
    prisma.commentLike.deleteMany(),
    prisma.bookmark.deleteMany(),
    prisma.readingProgress.deleteMany(),
    prisma.rating.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.chapter.deleteMany(),
    prisma.book.deleteMany(),
    prisma.twofactorConfirmation.deleteMany(),
    prisma.twoFactorToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create admin user
  const adminPassword = await hash('Admin123!', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      bio: 'Site administrator',
    },
  });

  // Create regular users
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const password = await hash(`User${i}123!`, 10);
    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: password,
        emailVerified: new Date(),
        bio: `This is the bio for User ${i}.`,
      },
    });
    users.push(user);
  }

  // Create books for each user
  const books = [];
  const bookTitles = [
    'The Midnight Library',
    'Project Hail Mary',
    'The Silent Patient',
    'Where the Crawdads Sing',
    'Atomic Habits',
    'The Four Winds',
    'Klara and the Sun',
    'The Vanishing Half',
  ];

  for (const user of users) {
    for (let i = 0; i < 2; i++) {
      const book = await prisma.book.create({
        data: {
          title: bookTitles[Math.floor(Math.random() * bookTitles.length)],
          description: `A fascinating book written by ${user.name}. This is a sample description that highlights the key themes and plot points of the story.`,
          thumbnail: `https://picsum.photos/seed/${Math.random()}/400/600`,
          tags: ['Fiction', 'Mystery', 'Romance'],
          published: Math.random() > 0.3, // 70% chance of being published
          authorId: user.id,
          rating: Math.random() * 5,
          totalRatings: Math.floor(Math.random() * 100),
          views: Math.floor(Math.random() * 1000),
          readTime: `${Math.floor(Math.random() * 10) + 1}h`,
          progress: Math.floor(Math.random() * 100),
        },
      });
      books.push(book);

      // Create chapters for each book
      const chapters = [];
      for (let j = 1; j <= 5; j++) {
        const chapter = await prisma.chapter.create({
          data: {
            title: `Chapter ${j}`,
            content: `This is the content of chapter ${j} for the book "${book.title}". It contains a lot of interesting content that readers will enjoy.`,
            order: j,
            progress: Math.floor(Math.random() * 100),
            bookId: book.id,
          },
        });
        chapters.push(chapter);
      }

      // Create comments for each chapter
      for (const chapter of chapters) {
        for (const commenter of users) {
          if (Math.random() > 0.7) { // 30% chance a user comments on a chapter
            await prisma.comment.create({
              data: {
                content: `This is a comment from ${commenter.name} on chapter ${chapter.order} of "${book.title}".`,
                userId: commenter.id,
                bookId: book.id,
                chapterId: chapter.id,
              },
            });
          }
        }
      }

      // Create reading progress for each chapter
      for (const chapter of chapters) {
        for (const reader of users) {
          if (Math.random() > 0.5) { // 50% chance a user has reading progress
            await prisma.readingProgress.create({
              data: {
                progress: Math.floor(Math.random() * 100),
                userId: reader.id,
                bookId: book.id,
                chapterId: chapter.id,
              },
            });
          }
        }
      }

      // Create bookmarks for each chapter
      for (const chapter of chapters) {
        for (const user of users) {
          if (Math.random() > 0.7) { // 30% chance a user has a bookmark
            await prisma.bookmark.create({
              data: {
                userId: user.id,
                bookId: book.id,
                chapterId: chapter.id,
                position: Math.random() * 0.9, // Random position (0-0.9)
                note: Math.random() > 0.5 ? `Note from ${user.name} at position ${Math.random().toFixed(2)}` : null,
                selectedText: Math.random() > 0.5 ? 'This is some selected text that the user bookmarked.' : null,
              },
            });
          }
        }
      }

      // Create likes and saves for each book
      for (const user of users) {
        if (Math.random() > 0.5) { // 50% chance a user likes a book
          await prisma.bookLike.create({
            data: {
              userId: user.id,
              bookId: book.id,
            },
          });
        }

        if (Math.random() > 0.7) { // 30% chance a user saves a book
          await prisma.bookSave.create({
            data: {
              userId: user.id,
              bookId: book.id,
            },
          });
        }
      }
    }
  }

  // Create follows between users
  for (const follower of users) {
    for (const following of users) {
      if (follower.id !== following.id && Math.random() > 0.6) { // 40% chance a user follows another user
        await prisma.follow.create({
          data: {
            followerId: follower.id,
            followingId: following.id,
          },
        });
      }
    }
  }

  // Make some users follow the admin
  for (const user of users) {
    if (Math.random() > 0.5) { // 50% chance a user follows the admin
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: admin.id,
        },
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });