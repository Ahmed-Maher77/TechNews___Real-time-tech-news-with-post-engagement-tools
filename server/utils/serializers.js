export function toPublicUser(userDoc) {
    if (!userDoc) return null;
    const u = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    delete u.password;
    return {
        id: u._id?.toString?.() ?? u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        userPic: u.userPic || "",
    };
}

export function toPublicPost(postDoc, authorFallback = "") {
    if (!postDoc) return null;
    const p = postDoc.toObject ? postDoc.toObject() : { ...postDoc };
    let authorName = authorFallback;
    if (p.author && typeof p.author === "object" && p.author.name) {
        authorName = p.author.name;
    }
    return {
        id: p._id?.toString?.() ?? p.id,
        title: p.title,
        author: authorName,
        category: p.category,
        description: p.description,
        content: p.content,
        image: p.image || "",
        date: p.date ? new Date(p.date).toISOString().slice(0, 10) : "",
        views: p.views ?? 0,
        likes: p.likes ?? 0,
        dislikes: p.dislikes ?? 0,
        comments: p.commentCount ?? 0,
        featured: Boolean(p.featured),
    };
}

export function toPublicComment(commentDoc) {
    if (!commentDoc) return null;
    const c = commentDoc.toObject ? commentDoc.toObject() : { ...commentDoc };
    const user = c.user && typeof c.user === "object" ? c.user : null;
    return {
        id: c._id?.toString?.() ?? c.id,
        text: c.text,
        upvotes: c.upvotes ?? 0,
        downvotes: c.downvotes ?? 0,
        createdAt: c.createdAt,
        name: user?.name || "User",
        userPic: user?.userPic || "",
    };
}
